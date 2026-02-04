import { Listing } from "@prisma/client";

export type ChecklistItem = { key: string; label: string; complete: boolean };

export function buildPublishChecklist(listing: Listing) {
  const items: ChecklistItem[] = [
    {
      key: "location",
      label: "Ubicación (departamento y distrito)",
      complete: Boolean(listing.department && listing.district)
    },
    {
      key: "surface",
      label: "Superficie total",
      complete: Boolean(listing.hectaresTotal && listing.hectaresTotal > 0)
    },
    {
      key: "type",
      label: "Tipo de campo",
      complete: Boolean(listing.type)
    },
    {
      key: "modality",
      label: "Modalidad",
      complete: Boolean(listing.modality)
    },
    {
      key: "price",
      label: "Precio",
      complete: Boolean(
        (listing.modality === "VENTA" && (listing.salePriceTotalUsd || listing.salePriceUsdPerHa)) ||
          (listing.modality === "ALQUILER" &&
            (listing.rentUsdPerHaPerYear ||
              (listing.rentCropSharePercent !== null && listing.rentCropSharePercent !== undefined)))
      )
    },
    {
      key: "contact",
      label: "Contacto (WhatsApp y email)",
      complete: Boolean(listing.phoneWhatsapp && listing.contactEmail)
    }
  ];

  const completed = items.filter((item) => item.complete).length;

  return { items, completed, total: items.length };
}
