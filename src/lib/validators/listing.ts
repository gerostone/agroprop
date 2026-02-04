import { z } from "zod";

export const listingDraftSchema = z.object({
  title: z.string().min(5).optional().nullable(),
  locationText: z.string().min(3).optional().nullable(),
  department: z.string().min(2).optional().nullable(),
  district: z.string().min(2).optional().nullable(),
  hectaresTotal: z.number().positive().optional().nullable(),
  type: z.enum(["AGRICOLA", "GANADERO", "MIXTO", "ARROCERO", "FORESTAL"]).optional().nullable(),
  modality: z.enum(["VENTA", "ALQUILER"]).optional().nullable(),
  description: z.string().min(20).optional().nullable(),
  phoneWhatsapp: z.string().min(6).optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  salePriceTotalUsd: z.number().positive().optional().nullable(),
  salePriceUsdPerHa: z.number().positive().optional().nullable(),
  rentUsdPerHaPerYear: z.number().positive().optional().nullable(),
  rentCropSharePercent: z.number().min(0).max(100).optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  productiveAptitude: z.string().optional().nullable(),
  currentUse: z.string().optional().nullable(),
  rotationsHistory: z.string().optional().nullable(),
  soilType: z.string().optional().nullable(),
  productivityIndex: z.number().optional().nullable(),
  waterSources: z.array(z.enum(["TAJAMAR", "ARROYO", "RIO", "POZO", "NINGUNO"])).optional(),
  hasElectricity: z.boolean().optional().nullable(),
  hasInternalRoads: z.boolean().optional().nullable(),
  hasFences: z.boolean().optional().nullable(),
  hasCorrals: z.boolean().optional().nullable(),
  hasSilos: z.boolean().optional().nullable(),
  hasSheds: z.boolean().optional().nullable(),
  distanceToPavedRouteKm: z.number().min(0).optional().nullable(),
  distanceToTownKm: z.number().min(0).optional().nullable(),
  yearRoundAccess: z.boolean().optional().nullable(),
  maxSlopePercentRange: z.enum(["P0_2", "P2_5", "P5_10", "P10_PLUS"]).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "PAUSED", "ARCHIVED"]).optional().nullable()
});

export const listingUpdateSchema = listingDraftSchema.partial();

export const listingPublishSchema = listingDraftSchema.superRefine((data, ctx) => {
  if (!data.department) {
    ctx.addIssue({ code: "custom", message: "department is required", path: ["department"] });
  }
  if (!data.district) {
    ctx.addIssue({ code: "custom", message: "district is required", path: ["district"] });
  }
  if (!data.hectaresTotal || data.hectaresTotal <= 0) {
    ctx.addIssue({ code: "custom", message: "hectaresTotal is required", path: ["hectaresTotal"] });
  }
  if (!data.type) {
    ctx.addIssue({ code: "custom", message: "type is required", path: ["type"] });
  }
  if (!data.modality) {
    ctx.addIssue({ code: "custom", message: "modality is required", path: ["modality"] });
  }
  if (!data.title || data.title.length < 5) {
    ctx.addIssue({ code: "custom", message: "title is required", path: ["title"] });
  }
  if (!data.description || data.description.length < 80) {
    ctx.addIssue({ code: "custom", message: "description min 80 chars", path: ["description"] });
  }
  if (!data.phoneWhatsapp) {
    ctx.addIssue({ code: "custom", message: "phoneWhatsapp is required", path: ["phoneWhatsapp"] });
  } else if (!/^\+?\d[\d\s-]{6,}$/.test(data.phoneWhatsapp)) {
    ctx.addIssue({ code: "custom", message: "phoneWhatsapp invalid format", path: ["phoneWhatsapp"] });
  }
  if (!data.contactEmail) {
    ctx.addIssue({ code: "custom", message: "contactEmail is required", path: ["contactEmail"] });
  }

  if (data.modality === "VENTA") {
    if (!data.salePriceTotalUsd && !data.salePriceUsdPerHa) {
      ctx.addIssue({
        code: "custom",
        message: "salePriceTotalUsd or salePriceUsdPerHa required",
        path: ["salePriceTotalUsd"]
      });
    }
  }

  if (data.modality === "ALQUILER") {
    if (!data.rentUsdPerHaPerYear && (data.rentCropSharePercent === null || data.rentCropSharePercent === undefined)) {
      ctx.addIssue({
        code: "custom",
        message: "rentUsdPerHaPerYear or rentCropSharePercent required",
        path: ["rentUsdPerHaPerYear"]
      });
    }
  }
});

export const listingImageSchema = z.object({
  url: z.string().url(),
  sortOrder: z.number().int().nonnegative().optional()
});

export const listingImagesSchema = z.union([listingImageSchema, z.array(listingImageSchema)]);

export const uploadRequestSchema = z.object({
  listingId: z.string().uuid(),
  fileName: z.string().min(3),
  contentType: z.string().min(3)
});
