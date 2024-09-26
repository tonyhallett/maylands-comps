export function getDbDate(date: Date) {
  return date.toLocaleDateString("en-GB");
}
export function getDbToday() {
  return getDbDate(new Date());
}
