export function dateToIsoString(date: Date | string): string {
  if (typeof date === "string") {
    return date;
  }
  return date.toISOString();
}