import { z } from "zod";

const userValidationSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    gender: z.enum(["male", "female"]),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters long"),
    avatar: z.string().url("Invalid image URL"),
  }),
});

export const UserValidation = {
  userValidationSchema,
};
