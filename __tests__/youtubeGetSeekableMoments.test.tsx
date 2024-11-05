import { Moment } from "../src/teamMatches/league/play/league-match-selection/livestreams/LivestreamProvider";
import {
  YouTubeInitialState,
  youtubeGetSeekableMoments,
} from "../src/teamMatches/league/play/league-match-selection/livestreams/providers/youtubeProvider";

describe("youtubeGetSeekableMoments", () => {
  interface Test {
    description: string;
    moment: Moment;
    expectIncluded: boolean;
    initialState: YouTubeInitialState;
    now: Date;
  }

  // for moments before current time
  // both need to be before now and before initial date
  const now = new Date(2024, 11, 1);
  const initialDate = new Date(2024, 10, 31);
  const initialMilliseconds = initialDate.getTime();
  const currentTime = 1000;
  const moreThanMilliseconds = initialMilliseconds - currentTime * 1000 + 1;
  const lessThanMilliseconds = initialMilliseconds - currentTime * 1000 - 1;

  const tests: Test[] = [
    {
      description: "should not include moments after now",
      moment: { date: new Date(2021, 1, 1) },
      initialState: { currentTime: 0, date: new Date(2020, 1, 1) },
      now: new Date(2020, 1, 1),
      expectIncluded: false,
    },
    {
      description: "should include moments before now and after initial date",
      moment: { date: new Date(2021, 1, 2) },
      initialState: { currentTime: 0, date: new Date(2020, 1, 1) },
      now: new Date(2021, 1, 3),
      expectIncluded: true,
    },

    {
      description:
        "should not include moments where seconds diff to initial date is more than current time",
      moment: { date: new Date(moreThanMilliseconds) },
      initialState: { currentTime, date: initialDate },
      now,
      expectIncluded: true,
    },
    {
      description:
        "should include moments where seconds diff to initial date is less than current time",
      moment: { date: new Date(lessThanMilliseconds) },
      initialState: { currentTime, date: initialDate },
      now,
      expectIncluded: false,
    },
  ];

  it.each(tests)(
    "$description",
    ({ moment, initialState, now, expectIncluded }) => {
      //todo
      const seekableMoments = youtubeGetSeekableMoments(
        [moment],
        initialState,
        now,
      );
      expect(seekableMoments).toHaveLength(expectIncluded ? 1 : 0);
    },
  );
});
