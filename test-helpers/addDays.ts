export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const getTomorrow = () => addDays(new Date(), 1);
export const getYesterday = () => addDays(new Date(), -1);
