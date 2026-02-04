import { z } from "zod";

export const listingSchema = z.object({
  title: z.string().min(5),
  priceUsd: z.number().nonnegative(),
  hectares: z.number().positive(),
  locationText: z.string().min(3),
  department: z.string().min(2),
  district: z.string().min(2),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  description: z.string().min(20),
  type: z.enum(["GANADERO", "AGRO", "MIXTO"]),
  hasWater: z.boolean(),
  hasTitle: z.boolean(),
  accessType: z.enum(["RUTA", "CAMINO", "MIXTO"])
});

export const listingUpdateSchema = listingSchema.partial();

export const listingImageSchema = z.object({
  url: z.string().url(),
  sortOrder: z.number().int().nonnegative().optional()
});

export const listingImagesSchema = z.union([
  listingImageSchema,
  z.array(listingImageSchema)
]);

export const uploadRequestSchema = z.object({
  listingId: z.string().uuid(),
  fileName: z.string().min(3),
  contentType: z.string().min(3)
});
