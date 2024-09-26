import todayOrAfter from "../../../helpers/todayOrAfter";
import { maylandsFixtures } from "./data/romfordLeagueData";

export default maylandsFixtures.filter((fixture) => {
  return todayOrAfter(fixture.date);
});
