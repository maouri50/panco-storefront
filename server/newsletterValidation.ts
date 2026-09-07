import { z } from "zod";

export const newsletterSubscribeInput = z.object({
  email: z.string().trim().email().max(320),
  consent: z.literal(true),
});

export const newsletterEmailInput = z.object({
  email: z.string().trim().email().max(320),
});
