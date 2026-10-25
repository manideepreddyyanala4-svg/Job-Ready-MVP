const configuredPrice = Number(process.env.NEXT_PUBLIC_PROJECT_PASS_INR ?? "499");

export const projectPassPriceInr = Number.isFinite(configuredPrice) && configuredPrice > 0
  ? Math.round(configuredPrice)
  : 499;

export const projectPassPriceLabel = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(projectPassPriceInr);
