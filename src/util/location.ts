export function getLocationQuery(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "";
  const [primary] = trimmed.split(",");
  return primary.trim() || trimmed;
}
