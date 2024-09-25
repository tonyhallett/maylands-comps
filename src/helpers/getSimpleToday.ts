export const getSimpleToday = () => getDbDate(new Date());

export const getDbDate = (date: Date) => date.toLocaleDateString("en-GB");
