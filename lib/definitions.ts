/**
Validate form fields on the server
Use the Server Action to validate the form fields on the server. If your authentication provider doesn't provide form validation, you can use a schema validation library like Zod or Yup.

Using Zod as an example, you can define a form schema with appropriate error messages:
*/
import * as z from 'zod'
  
export const SignupFormSchema = z.object({
  username: z
    .string()
    .min(2, { error: 'Name must be at least 2 characters long.' })
    .trim(),
  password: z
    .string()
    .min(6, { error: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { error: 'Contain at least one letter.' })
    .regex(/[0-9]/, { error: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      error: 'Contain at least one special character.',
    })
    .trim(),
  role: z
    .string()
    .default('CLIENT'),
})
  
export type FormState =
  | {
      errors?: {
        username?: string[]
        password?: string[]
        role?: string[]
      }
      message?: string
    }
  | undefined
