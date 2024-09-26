import { getDbDate, getDbToday } from "../src/helpers/getDbDate";
import todayOrAfter from "../src/helpers/todayOrAfter";
import { getTomorrow, getYesterday } from "../test-helpers/addDays";

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

  it("should return true for after today", () => {
    expect(todayOrAfter(getTomorrow())).toBe(true);
  });
  it("should return false for before today", () => {
    expect(todayOrAfter(getYesterday())).toBe(false);
  });
});
