export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("");
};

export const getTeamInitials = (
  player1Name: string,
  player2Name: string | undefined,
) => {
  const player1Initials = getInitials(player1Name);
  if (player2Name) {
    const player2Initials = getInitials(player2Name);
    return `${player1Initials} & ${player2Initials}`;
  }
  return player1Initials;
};
