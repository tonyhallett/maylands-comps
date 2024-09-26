import { todayOrAfter } from "../../../helpers/sameDate";
import { maylandsFixtures } from "./data/romfordLeagueData";
import {
  PromiseCallback,
  useCreateLeagueSeason,
} from "./useCreateLeagueSeason";

const maylandsFixturesToAdd = maylandsFixtures.filter((fixture) => {
  return todayOrAfter(fixture.date);
});

export function CreateLeagueSeason({
  promiseCallback = (promise) => {
    promise
      .then(() => alert("added"))
      .catch((reason) => alert(`error adding - ${reason}`));
  },
}: {
  promiseCallback?: PromiseCallback;
}) {
  useCreateLeagueSeason(maylandsFixturesToAdd, promiseCallback);
  return null;
}
