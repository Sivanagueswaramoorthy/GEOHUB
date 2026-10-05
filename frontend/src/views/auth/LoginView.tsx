import React, { useState } from 'react';
import {
  Globe,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Shield,
  Users2,
  User,
  QrCode,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, UserModel } from '../../types';
import {
  demoUsersList,
  demoSuperAdmin,
  demoAdmin,
  demoTeamAdmin,
  demoTreasurer,
  demoDocLead,
  demoMember,
  demoVolunteer,
} from '../../data/mockData';
import { AppAvatar } from '../../components/common/AppAvatar';
import { Modal } from '../../components/common/Modal';
import { ForgotPasswordModal } from '../../components/auth/ForgotPasswordModal';

// Official 4-color Google G icon SVG
const GoogleGIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const LoginView: React.FC = () => {
  const { loginWithUser, isPhoneFrame, setIsPhoneFrame } = useApp();

  const [activeLoginMode, setActiveLoginMode] = useState<'google' | 'roles' | 'credentials'>('google');
  const [email, setEmail] = useState('sarah.jenkins@college.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Google Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [isCustomGoogleMode, setIsCustomGoogleMode] = useState(false);

  // Join Request State
  const [showJoin, setShowJoin] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinTeam, setJoinTeam] = useState('Entertainment');
  const [joinRole, setJoinRole] = useState('Stage Host / Emcee');
  const [joinDept, setJoinDept] = useState('Geography');
  const [joinNote, setJoinNote] = useState('');

  // Designated Demo Roles for Role-Based Login
  const demoRoleProfiles: {
    role: UserRole;
    user: UserModel;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }[] = [
    {
      role: 'super_admin',
      user: demoSuperAdmin,
      title: 'Super Admin',
      description: 'Faculty Advisor • System oversight, approvals & reports',
      icon: <ShieldCheck size={20} color="#B45309" />,
      color: '#B45309',
      bgColor: '#FEF3C7',
    },
    {
      role: 'admin',
      user: demoAdmin,
      title: 'Club Admin',
      description: 'Club President • Event management & member rosters',
      icon: <Shield size={20} color="#4338CA" />,
      color: '#4338CA',
      bgColor: '#E0E7FF',
    },
    {
      role: 'team_admin',
      user: demoTeamAdmin,
      title: 'Promotion Lead',
      description: 'Squad Lead • Campaigns, content calendar & AI suggestions',
      icon: <Users2 size={20} color="#0F766E" />,
      color: '#0F766E',
      bgColor: '#CCFBF1',
    },
    {
      role: 'treasurer',
      user: demoTreasurer,
      title: 'Treasurer Lead',
      description: 'Squad Lead • Budgets, expenses, stock & audit reports',
      icon: <Users2 size={20} color="#0284C7" />,
      color: '#0284C7',
      bgColor: '#E0F2FE',
    },
    {
      role: 'documentation',
      user: demoDocLead,
      title: 'Documentation Lead',
      description: 'Squad Lead • Meeting minutes, templates & document archives',
      icon: <Users2 size={20} color="#7C3AED" />,
      color: '#7C3AED',
      bgColor: '#EDE9FE',
    },
    {
      role: 'volunteer',
      user: demoVolunteer,
      title: 'Volunteer',
      description: 'Terminal Scanner • Live camera QR verification & gate pass',
      icon: <QrCode size={20} color="#BE185D" />,
      color: '#BE185D',
      bgColor: '#FCE7F3',
    },
    {
      role: 'member',
      user: demoMember,
      title: 'Club Member',
      description: 'Student Scholar • Event passes, activities & community',
      icon: <User size={20} color="#15803D" />,
      color: '#15803D',
      bgColor: '#DCFCE7',
    },
  ];

  // Detect role from entered email
  const getDetectedUser = (enteredEmail: string): UserModel => {
    const lower = enteredEmail.toLowerCase().trim();
    const found = demoUsersList.find((u) => u.email.toLowerCase() === lower);
    if (found) return found;
    if (lower.includes('sarah')) return demoSuperAdmin;
    if (lower.includes('alex')) return demoAdmin;
    if (lower.includes('david')) return demoTeamAdmin;
    if (lower.includes('ananya')) return demoTreasurer;
    if (lower.includes('aarav') || lower.includes('priya')) return demoDocLead;
    if (lower.includes('liam')) return demoVolunteer;
    if (lower.includes('maya')) return demoMember;
    return demoMember;
  };

  const detectedUser = getDetectedUser(email);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithUser(detectedUser);
  };

  const handleGoogleAccountSelect = (user: UserModel) => {
    setIsGoogleModalOpen(false);
    loginWithUser(user);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    const user = getDetectedUser(customGoogleEmail);
    setIsGoogleModalOpen(false);
    loginWithUser({
      ...user,
      email: customGoogleEmail,
    });
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSent(true);
  };

  // If viewing "Join Request" Confirmation
  if (requestSent) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '24px',
          background: '#FFFFFF',
        }}
      >
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            color: '#16A34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 10px 24px rgba(22, 163, 74, 0.2)',
          }}
        >
          <CheckCircle2 size={40} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
          Membership Application Submitted!
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '380px', lineHeight: 1.5, marginBottom: '24px' }}>
          Welcome, <strong>{joinName}</strong>! Your application for the <strong>{joinTeam} Team</strong> as{' '}
          <strong>{joinRole}</strong> has been transmitted to faculty review. You will receive an invitation email upon executive sign-off.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            setRequestSent(false);
            setShowJoin(false);
          }}
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  // If viewing "Join Request" Form
  if (showJoin) {
    return (
      <div style={{ maxWidth: '480px', margin: '40px auto', padding: '24px 20px', background: '#FFFFFF' }}>
        <button
          onClick={() => setShowJoin(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#0F766E',
            marginBottom: '16px',
          }}
        >
          &larr; Back to Login
        </button>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F766E', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
            <Sparkles size={14} color="#14B8A6" />
            <span>Club Induction 2026</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
            Join GeoHub Club
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B' }}>
            Register your college profile for membership approval
          </p>
        </div>

        <form onSubmit={handleJoinSubmit} className="app-card" style={{ padding: '24px' }}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Fatima Zahra"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">College Workspace Email</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="name@college.edu"
              value={joinEmail}
              onChange={(e) => setJoinEmail(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div className="input-group">
              <label className="input-label">Department</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g. Geology"
                value={joinDept}
                onChange={(e) => setJoinDept(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Preferred Team</label>
              <select
                className="input-field"
                value={joinTeam}
                onChange={(e) => setJoinTeam(e.target.value)}
              >
                <option value="Management">Management</option>
                <option value="Promotion">Promotion</option>
                <option value="Documentation">Documentation</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Desired Team Designation / Role</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Stage Host, GIS Analyst, Media Creator"
              value={joinRole}
              onChange={(e) => setJoinRole(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Statement of Interest</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Tell us what excites you about Earth Science & Geo Club activities..."
              value={joinNote}
              onChange={(e) => setJoinNote(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '8px' }}>
            Submit Induction Request
          </button>
        </form>
      </div>
    );
  }

  // Main Standalone Login View (Mobile-First Centered Card)
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        position: 'relative',
      }}
    >
      {/* Top right viewport toggle */}
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <button
          className="emulator-view-btn"
          style={{ background: '#F1F5F9', color: '#0F172A', border: '1px solid #E8ECF2' }}
          onClick={() => setIsPhoneFrame((prev) => !prev)}
        >
          {isPhoneFrame ? <Monitor size={15} /> : <Smartphone size={15} />}
          <span>{isPhoneFrame ? 'Fullscreen Mode' : 'Mobile Frame'}</span>
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 12px 28px rgba(15, 118, 110, 0.25)',
              marginBottom: '16px',
            }}
          >
            <Globe size={32} />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            GeoHub
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '6px' }}>
            College Geospatial & Earth Science Club Platform
          </p>
        </div>

        {/* Auth Mode Tabs (Google Sign-In / Role-Based Demo / College ID) */}
        <div
          style={{
            display: 'flex',
            background: '#F8FAFC',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid #E8ECF2',
            marginBottom: '16px',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveLoginMode('google')}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: activeLoginMode === 'google' ? 700 : 500,
              backgroundColor: activeLoginMode === 'google' ? '#FFFFFF' : 'transparent',
              color: activeLoginMode === 'google' ? '#0F766E' : '#64748B',
              boxShadow: activeLoginMode === 'google' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 150ms ease',
            }}
          >
            <GoogleGIcon size={14} />
            <span>Google Sign-In</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLoginMode('roles')}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: activeLoginMode === 'roles' ? 700 : 500,
              backgroundColor: activeLoginMode === 'roles' ? '#FFFFFF' : 'transparent',
              color: activeLoginMode === 'roles' ? '#0F766E' : '#64748B',
              boxShadow: activeLoginMode === 'roles' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 150ms ease',
            }}
          >
            <ShieldCheck size={15} />
            <span>Select Role</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLoginMode('credentials')}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: activeLoginMode === 'credentials' ? 700 : 500,
              backgroundColor: activeLoginMode === 'credentials' ? '#FFFFFF' : 'transparent',
              color: activeLoginMode === 'credentials' ? '#0F766E' : '#64748B',
              boxShadow: activeLoginMode === 'credentials' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 150ms ease',
            }}
          >
            <Mail size={15} />
            <span>College Email</span>
          </button>
        </div>

        {/* 1. Google Sign-In Tab Content */}
        {activeLoginMode === 'google' && (
          <div className="app-card" style={{ padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                Single Sign-On with Google
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                Sign in with your verified university Google Workspace account
              </p>
            </div>

            {/* Official Google Button */}
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              style={{
                width: '100%',
                minHeight: '48px',
                padding: '12px 18px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#0F172A',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0F766E';
                e.currentTarget.style.backgroundColor = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <GoogleGIcon size={20} />
              <span>Continue with Google (@college.edu)</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E8ECF2' }}>
              <ShieldCheck size={16} color="#0F766E" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                Instant role assignment based on institutional Google directory permissions.
              </span>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <span
                onClick={() => setActiveLoginMode('roles')}
                style={{ fontSize: '13px', color: '#0F766E', fontWeight: 600, cursor: 'pointer' }}
              >
                Or pick a specific role to test &rarr;
              </span>
            </div>
          </div>
        )}

        {/* 2. Role-Based Login Tab Content */}
        {activeLoginMode === 'roles' && (
          <div className="app-card" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                Role-Based Instant Access
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B' }}>
                Select any club role to enter the app with pre-configured access rights
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
              {demoRoleProfiles.map((p) => (
                <div
                  key={p.user.uid}
                  onClick={() => loginWithUser(p.user)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #E8ECF2',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0F766E';
                    e.currentTarget.style.backgroundColor = '#F0FDFA';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E8ECF2';
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <AppAvatar name={p.user.name} size={38} />
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A', whiteSpace: 'nowrap' }}>
                          {p.user.name}
                        </span>
                        {p.icon}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#0F766E' }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '210px' }}>
                        {p.description}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F766E', flexShrink: 0, marginLeft: '8px' }}>
                    Login &rarr;
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Credentials Tab Content */}
        {activeLoginMode === 'credentials' && (
          <div className="app-card" style={{ padding: '24px' }}>
            <form onSubmit={handleCredentialsSubmit}>
              <div className="input-group">
                <label className="input-label">College Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    className="input-field"
                    style={{ paddingLeft: '40px' }}
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail
                    size={18}
                    color="#94A3B8"
                    style={{ position: 'absolute', left: '12px', top: '14px' }}
                  />
                </div>
              </div>

              {/* Detected Role Alert Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#F0FDFA',
                  border: '1px solid #CCFBF1',
                  marginBottom: '14px',
                  fontSize: '12px',
                }}
              >
                <span style={{ color: '#64748B' }}>Recognized Role:</span>
                <span style={{ fontWeight: 700, color: '#0F766E', textTransform: 'uppercase' }}>
                  {detectedUser.role.replace('_', ' ')} ({detectedUser.name})
                </span>
              </div>

              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="input-label">Password</label>
                  <span
                    onClick={() => setIsForgotPasswordOpen(true)}
                    style={{ fontSize: '12px', color: '#0F766E', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Forgot?
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input-field"
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock
                    size={18}
                    color="#94A3B8"
                    style={{ position: 'absolute', left: '12px', top: '14px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '14px', color: '#94A3B8', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  id="rememberCheck"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0F766E' }}
                />
                <label htmlFor="rememberCheck" style={{ fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                  Keep me signed in on this workstation
                </label>
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                Sign In as {detectedUser.name.split(' ')[0]}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* Footer: Join Club Callout */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ fontSize: '13px', color: '#64748B' }}>
            New student or applicant?{' '}
            <span
              onClick={() => setShowJoin(true)}
              style={{ color: '#0F766E', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Request to Join GeoHub
            </span>
          </p>
        </div>
      </div>

      {/* Google Account Selector Dialog (Simulated Google OAuth Screen) */}
      <Modal
        isOpen={isGoogleModalOpen}
        onClose={() => {
          setIsGoogleModalOpen(false);
          setIsCustomGoogleMode(false);
        }}
        title="Sign in with Google"
        subtitle="Choose an account to continue to GeoHub College Club"
        maxWidth="440px"
      >
        {!isCustomGoogleMode ? (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', maxHeight: '380px', overflowY: 'auto' }}>
              {demoRoleProfiles.map((p) => (
                <div
                  key={p.user.uid}
                  onClick={() => handleGoogleAccountSelect(p.user)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #E8ECF2',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <AppAvatar name={p.user.name} size={38} />
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A', whiteSpace: 'nowrap' }}>
                        {p.user.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.user.email}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: p.bgColor,
                      color: p.color,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {p.title}
                  </span>
                </div>
              ))}
            </div>

            <div
              onClick={() => setIsCustomGoogleMode(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px dashed #CBD5E1',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0F766E',
              }}
            >
              <GoogleGIcon size={18} />
              <span>Use another @college.edu Google account</span>
            </div>

            <div style={{ marginTop: '16px', fontSize: '11px', color: '#94A3B8', textAlign: 'center', lineHeight: 1.4 }}>
              To continue, Google will share your name, email address, and institutional authorization with GeoHub.
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomGoogleSubmit}>
            <div className="input-group">
              <label className="input-label">Enter College Google Email</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="your.name@college.edu"
                value={customGoogleEmail}
                onChange={(e) => setCustomGoogleEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setIsCustomGoogleMode(false)}
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Continue with Google
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Forgot Password BottomSheet Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        defaultEmail={email}
      />
    </div>
  );
};
