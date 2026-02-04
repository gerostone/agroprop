export function formatUsd(value: number) {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}
