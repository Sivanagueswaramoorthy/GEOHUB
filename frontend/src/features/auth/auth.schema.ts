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

  return z
    .object({
      rollNo: z.string().trim().optional(),
      email: z.string().trim().optional(),
      password: z
        .string()
        .min(1, { message: 'Password is required' })
        .min(8, { message: 'Password must be at least 8 characters' }),
      rememberMe: z.boolean().default(true),
    })
    .superRefine((val, ctx) => {
      // Must provide either rollNo or email
      if (!val.rollNo && !val.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Roll Number is required',
          path: ['rollNo'],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Institutional email is required',
          path: ['email'],
        });
        return;
      }

      // If email provided without rollNo, validate email format
      if (val.email && !val.rollNo) {
        const lower = val.email.toLowerCase().trim();
        if (!roleKeywords.includes(lower)) {
          if (!z.string().email().safeParse(val.email).success) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Enter a valid email address (e.g. name@college.edu)',
              path: ['email'],
            });
          } else if (activeDomain && !lower.endsWith(`@${activeDomain.toLowerCase()}`)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Please use your institutional @${activeDomain} address`,
              path: ['email'],
            });
          }
        }
      }
    });
};

export const loginSchema = createLoginSchema();

export type LoginFormData = {
  rollNo?: string;
  email?: string;
  password: string;
  rememberMe?: boolean;
};

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Institutional email is required' })
    .email({ message: 'Enter a valid institutional email' }),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
