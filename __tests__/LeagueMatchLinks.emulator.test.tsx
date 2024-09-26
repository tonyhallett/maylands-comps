import { getDbDate, getDbToday } from "../src/helpers/getDbDate";
import { todayOrAfter } from "../src/helpers/sameDate";

describe("db date", () => {
  it("should have the same value for dates on the same day", async () => {
    const now = new Date();
    const year = now.getFullYear();
    const fixtureMonth = now.getMonth();
    const day = now.getDate();

    const fixtureDate = new Date(year, fixtureMonth, day);
    const fixtureDbDate = getDbDate(fixtureDate);
    // create a promise from a timer that will resolve in 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const nowDbDate = getDbToday();
    expect(fixtureDbDate).toBe(nowDbDate);
  });
});

describe("todayOrAfter", () => {
  it("should return true for today", () => {
    const today = new Date();
    expect(todayOrAfter(today)).toBe(true);
  });
  function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  it("should return true for after today", () => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    expect(todayOrAfter(tomorrow)).toBe(true);
  });
  it("should return false for before today", () => {
    const today = new Date();
    const yesterday = addDays(today, -1);
    expect(todayOrAfter(yesterday)).toBe(false);
  });
});
