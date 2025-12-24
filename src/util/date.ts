export function addDaysToDate(date: string, days: number): string {
  if (!date || Number.isNaN(days)) return "";

  const result = new Date(date);
  if (Number.isNaN(result.getTime())) return "";

  result.setDate(result.getDate() + days);
  return result.toISOString().split("T")[0];
}
