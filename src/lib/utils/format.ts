export function formatUsd(value: number) {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatListingPrice(input: {
  modality?: "VENTA" | "ALQUILER" | null;
  salePriceTotalUsd?: number | null;
  salePriceUsdPerHa?: number | null;
  rentUsdPerHaPerYear?: number | null;
  rentCropSharePercent?: number | null;
}) {
  if (input.modality === "VENTA") {
    if (input.salePriceTotalUsd) return `${formatUsd(input.salePriceTotalUsd)} total`;
    if (input.salePriceUsdPerHa) return `${formatUsd(input.salePriceUsdPerHa)} / ha`;
  }

  if (input.modality === "ALQUILER") {
    if (input.rentUsdPerHaPerYear) return `${formatUsd(input.rentUsdPerHaPerYear)} / ha / año`;
    if (input.rentCropSharePercent) return `${input.rentCropSharePercent}% cosecha`;
  }

  return "Consultar";
}
