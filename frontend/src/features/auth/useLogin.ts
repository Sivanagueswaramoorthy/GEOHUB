import { useState, useEffect, useCallback, useRef } from 'react';
import { UserModel, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { canAccessRoute } from '../../core/permissions';
import { demoUsersList, demoSuperAdmin, demoAdmin, demoDocLead, demoTreasurer, demoTeamAdmin, demoVolunteer, demoMember } from '../../data/mockData';
import { LoginFormData } from './auth.schema';

export interface AuthErrorState {
  code: '401' | '403' | '429' | 'NETWORK' | 'UNKNOWN' | null;
  message: string | null;
  retryable?: boolean;
  requestId?: string;
}

export interface UseLoginOptions {
  onSuccessRedirect?: (targetRoute: string) => void;
}

const AUTH_STORAGE_KEY = 'geohub_auth_session';

export const useLogin = (options?: UseLoginOptions) => {
  const { loginWithUser, setActiveTab, currentUser, isAuthenticated } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorState, setErrorState] = useState<AuthErrorState>({ code: null, message: null });
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check URL parameters: ?reason=expired and ?next=<path>
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('reason') === 'expired') {
      setIsSessionExpired(true);
    }
  }, []);

  // Rate-limit countdown management
  useEffect(() => {
    if (rateLimitSeconds > 0) {
      countdownTimerRef.current = setInterval(() => {
        setRateLimitSeconds((prev) => {
          if (prev <= 1) {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            setErrorState({ code: null, message: null });
            return 0;
          }
          const next = prev - 1;
          setErrorState((curr) => ({
            ...curr,
            message: `Too many attempts. Try again in ${Math.ceil(next / 60)} minute${next > 60 ? 's' : ''} (${next}s).`,
          }));
          return next;
        });
      }, 1000);
    }

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [rateLimitSeconds]);

  // Cross-tab sync: detect session in another tab
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY && e.newValue) {
        try {
          const session = JSON.parse(e.newValue);
          if (session?.user) {
            loginWithUser(session.user);
            resolveRedirect(session.user);
          }
        } catch {
          // ignore corrupted cross-tab storage
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loginWithUser]);

  // Determine post-login redirect path
  const resolveRedirect = useCallback(
    (user: UserModel) => {
      if (user.status === 'pending') {
        setActiveTab('pending-approval');
        window.location.hash = 'pending-approval';
        options?.onSuccessRedirect?.('pending-approval');
        return;
      }

      let targetRoute = 'home';
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const nextParam = params.get('next');
        if (nextParam) {
          const cleaned = nextParam.replace(/^[\/#]+/, '').trim();
          if (cleaned) {
            const check = canAccessRoute(cleaned, user.role);
            if (check.allowed) {
              targetRoute = cleaned;
            }
          }
        }
      }

      setActiveTab(targetRoute);
      window.location.hash = targetRoute === 'home' ? '' : targetRoute;
      options?.onSuccessRedirect?.(targetRoute);
    },
    [setActiveTab, options]
  );

  // Authenticate user with credentials
  const authenticate = async (data: LoginFormData): Promise<boolean> => {
    if (rateLimitSeconds > 0) return false;

    setIsLoading(true);
    setErrorState({ code: null, message: null });

    const trimmedEmail = data.email.trim().toLowerCase();
    const password = data.password;
    const rememberMe = Boolean(data.rememberMe);

    try {
      const useMock = import.meta.env?.VITE_USE_MOCK !== 'false';
      const apiUrl = import.meta.env?.VITE_API_URL || '';

      let authResult: { user: UserModel; token: string } | null = null;

      if (!useMock && apiUrl) {
        // Real Backend Authentication Call
        try {
          const res = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: trimmedEmail,
              password,
            }),
          });

          if (!res.ok) {
            if (res.status === 401) {
              setErrorState({ code: '401', message: 'Incorrect email or password.' });
              setIsLoading(false);
              return false;
            }
            if (res.status === 403) {
              setErrorState({
                code: '403',
                message: 'Your account is awaiting approval or has been suspended. Contact your club coordinator.',
              });
              setIsLoading(false);
              return false;
            }
            if (res.status === 429) {
              const retryAfter = parseInt(res.headers.get('Retry-After') || '60', 10);
              const waitSec = isNaN(retryAfter) ? 60 : retryAfter;
              setRateLimitSeconds(waitSec);
              setErrorState({
                code: '429',
                message: `Too many attempts. Try again in ${Math.ceil(waitSec / 60)} minute(s).`,
              });
              setIsLoading(false);
              return false;
            }
            const data = await res.json().catch(() => ({}));
            setErrorState({
              code: 'UNKNOWN',
              message: data.message || 'Authentication failed. Please check your credentials.',
              requestId: data.requestId || `req_${Date.now().toString(36)}`,
            });
            setIsLoading(false);
            return false;
          }

          const responseData = await res.json();
          authResult = {
            user: responseData.user,
            token: responseData.token || responseData.accessToken || 'token_' + Date.now(),
          };
        } catch (netErr: any) {
          // If network error occurred and no mock fallback desired
          if (!useMock) {
            setErrorState({
              code: 'NETWORK',
              message: "Can't reach the server. Check your connection and try again.",
              retryable: true,
            });
            setIsLoading(false);
            return false;
          }
        }
      }

      // Mock Adapter Path
      if (!authResult) {
        // Artificial latency for premium UX feel
        await new Promise((resolve) => setTimeout(resolve, 450));

        // Testing error triggers
        if (trimmedEmail.includes('ratelimit')) {
          setRateLimitSeconds(120);
          setErrorState({
            code: '429',
            message: 'Too many attempts. Try again in 2 minutes.',
          });
          setIsLoading(false);
          return false;
        }

        if (trimmedEmail.includes('suspended') || trimmedEmail.includes('403')) {
          setErrorState({
            code: '403',
            message: 'Your account is awaiting approval or has been suspended. Contact your club coordinator.',
          });
          setIsLoading(false);
          return false;
        }

        if (trimmedEmail.includes('network') || password === 'networkfail') {
          setErrorState({
            code: 'NETWORK',
            message: "Can't reach the server. Check your connection and try again.",
            retryable: true,
          });
          setIsLoading(false);
          return false;
        }

        const normalizedPass = password.trim().replace(/\s+/g, '');

        if (normalizedPass === 'wrongpassword' || normalizedPass === 'invalid123') {
          setErrorState({
            code: '401',
            message: 'Incorrect email or password.',
          });
          setIsLoading(false);
          return false;
        }

        const id = trimmedEmail.toLowerCase().replace(/[\s_\-.]+/g, '');

        // Match known demo users by email
        let found = demoUsersList.find((u) => u.email.toLowerCase() === trimmedEmail);

        if (!found) {
          if (
            id === 'superadmin' ||
            id === 'super' ||
            id.includes('superadmin') ||
            id === 'faculty' ||
            id.includes('advisor') ||
            trimmedEmail.includes('sarah')
          ) {
            found = demoSuperAdmin;
          } else if (
            id === 'admin' ||
            id.includes('coordinator') ||
            id.includes('president') ||
            id === 'pres' ||
            id === 'vp' ||
            trimmedEmail.includes('alex') ||
            trimmedEmail.includes('elena')
          ) {
            found = demoAdmin;
          } else if (
            id === 'doc' ||
            id.startsWith('doc') ||
            id.includes('documentation') ||
            trimmedEmail.includes('aarav')
          ) {
            found = demoDocLead;
          } else if (
            id === 'tres' ||
            id === 'treas' ||
            id.startsWith('tres') ||
            id.startsWith('treas') ||
            id.includes('treasurer') ||
            trimmedEmail.includes('ananya')
          ) {
            found = demoTreasurer;
          } else if (
            id === 'promo' ||
            id.startsWith('promo') ||
            id.includes('promotion') ||
            trimmedEmail.includes('david')
          ) {
            found = demoTeamAdmin;
          } else if (
            id === 'volunteer' ||
            id.startsWith('volunt') ||
            trimmedEmail.includes('volunteer') ||
            trimmedEmail.includes('liam')
          ) {
            found = demoVolunteer;
          } else if (
            id === 'member' ||
            id === 'student' ||
            trimmedEmail.includes('maya')
          ) {
            found = demoMember;
          } else {
            // General valid student scholar account
            found = {
              ...demoMember,
              uid: `u_${Date.now().toString(36)}`,
              email: trimmedEmail.includes('@') ? trimmedEmail : `${trimmedEmail}@college.edu`,
              name: trimmedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            };
          }
        }

        authResult = {
          user: found,
          token: `geohub_jwt_mock_${Date.now()}`,
        };
      }

      // Successful Authentication Handler
      const { user, token } = authResult;

      const sessionPayload = {
        token,
        user,
        rememberMe,
        createdAt: Date.now(),
      };

      if (rememberMe) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionPayload));
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionPayload));
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }

      setIsSuccess(true);
      loginWithUser(user);

      // Brief success animation (400ms) before executing redirect
      setTimeout(() => {
        resolveRedirect(user);
      }, 400);

      return true;
    } catch {
      setErrorState({
        code: 'NETWORK',
        message: "Can't reach the server. Check your connection and try again.",
        retryable: true,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Tap sign-in with full demo user model
  const loginDemoPersona = async (user: UserModel) => {
    setIsLoading(true);
    setErrorState({ code: null, message: null });

    const sessionPayload = {
      token: `demo_token_${user.uid}`,
      user,
      rememberMe: true,
      createdAt: Date.now(),
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionPayload));

    setIsSuccess(true);
    loginWithUser(user);

    setTimeout(() => {
      resolveRedirect(user);
    }, 350);
  };

  const clearError = () => {
    setErrorState({ code: null, message: null });
  };

  return {
    authenticate,
    loginDemoPersona,
    isLoading,
    isSuccess,
    errorState,
    rateLimitSeconds,
    isSessionExpired,
    clearError,
  };
};
