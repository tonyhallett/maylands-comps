import { maylandsFixtures } from "./romfordLeagueData";

function maylandsFixturesPerDate() {
  const dateMap = new Map<string, number>();
  maylandsFixtures.forEach((fixture) => {
    const date = fixture.date.toDateString();
    const count = dateMap.get(date) || 0;
    dateMap.set(date, count + 1);
  });
  return dateMap;
}

export function getMaylandsFixturesOnSingleDateStats() {
  const dateMap = maylandsFixturesPerDate();
  return {
    max: maxFixturesOnASingleDate(dateMap), // 6
    average: averageFixtureOnASingleDate(dateMap), // 2.9090
  };
}

function averageFixtureOnASingleDate(dateMap: Map<string, number>) {
  const total = Array.from(dateMap.values()).reduce((acc, value) => {
    return acc + value;
  }, 0);
  return total / dateMap.size;
}

function maxFixturesOnASingleDate(dateMap: Map<string, number>) {
  return Math.max(...dateMap.values());
}
