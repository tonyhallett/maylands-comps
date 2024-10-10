import { getInitials } from "../../../../umpireView/helpers";
import { clubSetups, maylandsFixtures } from "./romfordLeagueData";

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

export function memberNamesStats() {
  const playerNames = clubSetups.flatMap((clubSetup) =>
    clubSetup.teamSetups.flatMap((teamSetup) => teamSetup.playerNames),
  );
  const sameInitialsAndSurnameMap = new Map<string, number>();
  playerNames.forEach((name) => {
    const initials = getInitials(name);
    const surname = name.split(" ").pop()!;
    const key = `${initials} ${surname}`;
    const count = sameInitialsAndSurnameMap.get(key) || 0;
    sameInitialsAndSurnameMap.set(key, count + 1);
  });
  const sameSurnameAndInitials = Array.from(
    sameInitialsAndSurnameMap.entries(),
  ).filter(([, count]) => count > 1);

  const stats = {
    initialsCounts: {},
    averageLength: 0,
    totalLength: 0,
    numPlayers: 0,
    longestName: "",
    longestNameLength: 0,
    longestSurname: "",
    longestSurnameLength: 0,
    sameSurnameAndInitials,
  };
  playerNames.forEach((name) => {
    const numInitials = getInitials(name).length;
    const length = name.length;
    if (stats.longestName.length < length) {
      stats.longestName = name;
    }
    const parts = name.split(" ");
    const surname = parts[parts.length - 1];
    if (stats.longestSurname.length < surname.length) {
      stats.longestSurname = surname;
    }

    stats.totalLength += length;
    stats.initialsCounts[numInitials] =
      (stats.initialsCounts[numInitials] || 0) + 1;
    stats.numPlayers++;
  });
  stats.averageLength = stats.totalLength / stats.numPlayers;
  stats.longestNameLength = stats.longestName.length;
  stats.longestSurnameLength = stats.longestSurname.length;
  console.log(JSON.stringify(stats, null, 2));
}
