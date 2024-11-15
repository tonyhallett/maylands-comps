import { MaylandsFixture } from "./data/romfordLeagueData";
import maylandsFixturesToAdd from "./maylandsFixturesToAdd";
import {
  PromiseCallback,
  useCreateLeagueSeason,
} from "./useCreateLeagueSeason";

export function CreateLeagueSeason({
  promiseCallback = (promise) => {
    promise
      .then(() => alert("added"))
      .catch((reason) => alert(`error adding - ${reason}`));
  },
  fixtures = maylandsFixturesToAdd,
}: {
  promiseCallback?: PromiseCallback;
  fixtures?: MaylandsFixture[];
}) {
  useCreateLeagueSeason(fixtures, promiseCallback);
  return null;
}
