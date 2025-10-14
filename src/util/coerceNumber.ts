export function coerceNumber(value: string | number | null): number {
  if (value === null) {
    return 0;
  }
  if (isNaN(Number(value))) {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }

  return Number(value.replace(/^0+/, ""));
}
