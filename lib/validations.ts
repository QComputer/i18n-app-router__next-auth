/**
 * Form Validation Utilities
 * 
 * Client-side form validation utilities with Zod integration
 * for schemas and custom validation rules.
 */

import { z } from "zod";

// ============== Validation Schemas ==============

/**
 * Email validation schema
 */
export const emailSchema = z.string().email("Please enter a valid email address");

/**
 * Phone number validation schema
 * Supports international formats
 */
export const phoneSchema = z
  .string()
  .regex(
    /^[+]?[(]?[0-9]{1,3}[)]?[-\s./0-9]{8,15}$/,
    "Please enter a valid phone number"
  )
  .optional()
  .or(z.literal(""));

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

/**
 * Username validation schema
 */
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be less than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces");

/**
 * Required string validation
 */
export const requiredStringSchema = (min = 1, max = 500) =>
  z.string().min(min, `This field is required`).max(max);

// ============== Form Validation Helper ==============

/**
 * Form validation result type
 */
export interface ValidationResult {
  success: boolean;
  errors: Record<string, string>;
  data?: Record<string, unknown>;
}

/**
 * Validate form data against a Zod schema
 */
export function validateForm<T>(
  data: Record<string, unknown>,
  schema: z.ZodSchema<T>
): ValidationResult {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      errors: {},
      data: result.data as Record<string, unknown>,
    };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return {
    success: false,
    errors,
  };
}

/**
 * Validate individual field
 */
export function validateField(
  value: unknown,
  schema: z.ZodSchema
): { success: boolean; error?: string } {
  const result = schema.safeParse(value);
  
  if (result.success) {
    return { success: true };
  }
  
  return {
    success: false,
    error: result.error.issues[0]?.message || "Invalid value",
  };
}

// ============== Common Validation Rules ==============

/**
 * Password strength checker
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Use at least 8 characters");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add an uppercase letter");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add a lowercase letter");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add a number");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add a special character");
  }

  return { score, feedback };
}

/**
 * Check if passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * Validate Iranian phone number
 */
export function validateIranianPhone(phone: string): boolean {
  // Iranian mobile numbers: 09123456789, 00989123456789, +989123456789
  const iranianMobileRegex = /^(?:(\+98|0098)|0)?9[0-9]{9}$/;
  return iranianMobileRegex.test(phone.replace(/[\s-]/g, ""));
}

// ============== Zod Schemas for Common Forms ==============

/**
 * Sign in form schema
 */
export const signInSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Sign up form schema
 */
export const signUpSchema = z.object({
  username: usernameSchema,
  email: emailSchema.optional().or(z.literal("")),
  name: nameSchema.optional(),
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => passwordsMatch(data.password, data.confirmPassword), {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Profile form schema
 */
export const profileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional().or(z.literal("")),
  phone: phoneSchema,
  locale: z.string().optional(),
});

/**
 * Password change schema
 */
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => passwordsMatch(data.newPassword, data.confirmPassword), {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Service form schema
 */
export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required").max(100),
  description: z.string().max(500).optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  price: z.number().min(0, "Price cannot be negative").optional(),
  currency: z.string().default("IRR"),
});

/**
 * Staff form schema
 */
export const staffSchema = z.object({
  userId: z.string().min(1, "Please select a user"),
  bio: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

/**
 * Appointment form schema
 */
export const appointmentSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  staffId: z.string().optional(),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: emailSchema.optional().or(z.literal("")),
  clientPhone: phoneSchema,
  notes: z.string().max(1000).optional(),
});

/**
 * Organization form schema
 */
export const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  type: z.enum(["LAWYER", "DOCTOR", "SUPERMARKET", "RESTAURANT", "SALON", "OTHER"]),
  description: z.string().max(500).optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("")),
  address: z.string().max(200).optional(),
  timezone: z.string().default("Asia/Tehran"),
  locale: z.string().default("fa"),
});
