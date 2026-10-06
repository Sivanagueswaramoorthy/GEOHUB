import { z } from 'zod';

const allowedDomain = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ALLOWED_EMAIL_DOMAIN) || '';

export const createLoginSchema = (domainConstraint?: string) => {
  const activeDomain = domainConstraint ?? allowedDomain;

  const roleKeywords = [
    'superadmin',
    'super_admin',
    'super',
    'faculty',
    'advisor',
    'admin',
    'coordinator',
    'president',
    'pres',
    'vp',
    'doc',
    'doclead',
    'documentation',
    'tres',
    'treas',
    'treasurer',
    'treasury',
    'promo',
    'promolead',
    'promotion',
    'volunteer',
    'member',
    'student',
  ];

  return z.object({
    email: z
      .string()
      .trim()
      .min(1, { message: 'Institutional email is required' })
      .refine(
        (val) => {
          const lower = val.toLowerCase().trim();
          if (roleKeywords.includes(lower)) return true;
          return z.string().email().safeParse(val).success;
        },
        { message: 'Enter a valid email address (e.g. name@college.edu)' }
      )
      .refine(
        (val) => {
          const lower = val.toLowerCase().trim();
          if (roleKeywords.includes(lower)) return true;
          if (!activeDomain) return true;
          return val.toLowerCase().endsWith(`@${activeDomain.toLowerCase()}`);
        },
        {
          message: `Please use your institutional @${activeDomain} address`,
        }
      ),
    password: z
      .string()
      .min(1, { message: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters' }),
    rememberMe: z.boolean().default(true),
  });
};

export const loginSchema = createLoginSchema();

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Enter a valid institutional email' }),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
