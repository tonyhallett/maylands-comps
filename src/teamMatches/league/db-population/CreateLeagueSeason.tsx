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
}: {
  promiseCallback?: PromiseCallback;
}) {
  useCreateLeagueSeason(maylandsFixturesToAdd, promiseCallback);
  return null;
}
