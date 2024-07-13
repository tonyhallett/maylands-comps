import { Box, Typography } from "@mui/material";
import { MatchOptions } from "../../umpire";

export type RulesViewProps = Omit<
  MatchOptions,
  "team1StartGameScore" | "team2StartGameScore"
> & {
  team1EndsAt: number;
  team2EndsAt: number;
  team1Identifier: string;
  team2Identifier: string;
};

export function RulesView({
  clearBy2,
  numServes,
  upTo,
  bestOf,
  team1EndsAt,
  team2EndsAt,
  team1Identifier,
  team2Identifier,
}: RulesViewProps) {
  const clearBy = clearBy2 ? 2 : 1;
  const endsAt =
    team1EndsAt === team2EndsAt ? (
      <Typography>{`Ends - ${team1EndsAt}`}</Typography>
    ) : (
      <>
        <Typography>{`${team1Identifier} ends - ${team1EndsAt}`}</Typography>
        <Typography>{`${team2Identifier} ends - ${team2EndsAt}`}</Typography>
      </>
    );
  return (
    <Box p={1} border={1} borderRadius={1} sx={{ userSelect: "none" }}>
      <Typography>{`Best of ${bestOf}`}</Typography>
      <Typography>{`Up to ${upTo}`}</Typography>
      <Typography>{`${numServes} serves`}</Typography>
      <Typography>{`Clear by ${clearBy}`}</Typography>
      {endsAt}
    </Box>
  );
}
