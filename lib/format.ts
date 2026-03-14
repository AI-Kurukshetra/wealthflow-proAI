const compactCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 1,
  notation: "compact",
  style: "currency",
})

export function formatCompactCurrency(value: number) {
  return compactCurrencyFormatter.format(value)
}
