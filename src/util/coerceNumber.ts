export function coerceNumber(value: string | number | null): number {
  if (value === null) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  const coerced = Number(value.replace(/^0+/, "").replace(/[^0-9.]/g, "") || 0);

  if (isNaN(coerced)) {
    return 0;
  }
  return coerced;
}
