interface YearMonthDay {
  year: number;
  month: number;
  day: number;
}

const getYearMonthDay = (date: Date): YearMonthDay => {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
};
const getApproxDays = (date: Date): number => {
  const yearMonthDay = getYearMonthDay(date);
  return yearMonthDay.year * 365 + yearMonthDay.month * 30 + yearMonthDay.day;
};

export const createSameDayOrAfter = (compareToDate: Date) => {
  const compareToApproxDays = getApproxDays(compareToDate);
  return function (isItSameDayOrAfterCompareToDate: Date): boolean {
    const isItSameDayOrAfterApproxDays = getApproxDays(
      isItSameDayOrAfterCompareToDate,
    );
    return isItSameDayOrAfterApproxDays >= compareToApproxDays;
  };
};
