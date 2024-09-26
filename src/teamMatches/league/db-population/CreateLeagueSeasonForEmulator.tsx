import { useCreateLeagueSeason } from "./useCreateLeagueSeason";
import { maylandsFixtures } from "./data/romfordLeagueData";

const maylandsFixturesToAdd = maylandsFixtures.map((fixture) => {
  return {
    ...fixture,
    date: new Date(),
  };
});

export function CreateLeagueSeasonForEmulator() {
  useCreateLeagueSeason(maylandsFixturesToAdd, (promise) => {
    promise
      .then(() => alert("added"))
      .catch((reason) => alert(`error adding - ${reason}`));
  });
  return null;
}
