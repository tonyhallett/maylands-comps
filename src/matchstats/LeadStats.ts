import { PointState, PointHistory } from "../umpire";

export interface TeamLeads {
  biggest: number | undefined;
  greatestDeficitOvercome: number | undefined;
}
export interface Leads {
  team1?: TeamLeads;
  team2?: TeamLeads;
  numChanges: number;
}

enum Leader {
  StartOfGame,
  Team1,
  Team2,
}
export class LeadStats {
  private lastPointState = PointState.NotWon;
  private biggestLeads = {
    team1: 0,
    team2: 0,
  };
  private leader = Leader.StartOfGame;
  private leadChanges = 0;
  nextPoint = (point: PointHistory) => {
    const lead = Math.abs(point.team1Points - point.team2Points);
    const team1Leads = point.team1Points > point.team2Points;
    if (lead > 0) {
      this.determineLeadChanges(team1Leads);
    }
    if (team1Leads) {
      this.biggestLeads.team1 = Math.max(this.biggestLeads.team1, lead);
    } else {
      this.biggestLeads.team2 = Math.max(this.biggestLeads.team2, lead);
    }
    this.lastPointState = point.pointState;
  };

  private determineLeadChanges(team1Leads: boolean) {
    if (this.leader !== Leader.StartOfGame) {
      const leadChanged = team1Leads
        ? this.leader === Leader.Team2
        : this.leader === Leader.Team1;
      if (leadChanged) {
        this.leadChanges++;
        this.leader = team1Leads ? Leader.Team1 : Leader.Team2;
      }
    }
    this.leader = team1Leads ? Leader.Team1 : Leader.Team2;
  }

  getStats(): Leads | undefined {
    if (this.biggestLeads.team1 > 0 || this.biggestLeads.team2 > 0) {
      const leads: Leads = {
        numChanges: this.leadChanges,
      };
      leads.team1 =
        this.biggestLeads.team1 > 0
          ? {
              biggest: this.biggestLeads.team1,
              greatestDeficitOvercome: undefined,
            }
          : undefined;
      leads.team2 =
        this.biggestLeads.team2 > 0
          ? {
              biggest: this.biggestLeads.team2,
              greatestDeficitOvercome: undefined,
            }
          : undefined;
      if (
        this.lastPointState === PointState.GameWonTeam1 ||
        this.lastPointState === PointState.Team1Won
      ) {
        leads.team1!.greatestDeficitOvercome = leads.team2?.biggest;
      }
      if (
        this.lastPointState === PointState.GameWonTeam2 ||
        this.lastPointState === PointState.Team2Won
      ) {
        leads.team2!.greatestDeficitOvercome = leads.team1?.biggest;
      }
      return leads;
    }
  }
}
