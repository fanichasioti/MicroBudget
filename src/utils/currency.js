const euroFormatter = new Intl.NumberFormat("el-GR", {
  style: "currency",
  currency: "EUR",
});

export function formatCurrency(amount) {
  return euroFormatter.format(amount);
}
