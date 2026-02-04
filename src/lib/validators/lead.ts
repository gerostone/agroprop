import { z } from "zod";

export const leadSchema = z.object({
  listingId: z.string().uuid(),
  senderName: z.string().min(2),
  senderEmail: z.string().email(),
  senderPhone: z.string().min(6),
  message: z.string().min(10)
});
