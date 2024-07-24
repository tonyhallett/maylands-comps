import { PointState, PointHistory } from "../umpire";
import {
  team1WonGameOrMatch,
  team2WonGameOrMatch,
} from "../umpire/pointStateHelpers";

export interface LeadsStats {
  team1: TeamLeads;
  team2: TeamLeads;
  numChanges: number;
}

export interface LeadInfo {
  fromPoint: number;
  biggestLead: number;
  leadingFor: number;
}
export interface TeamLeads {
  biggest: number;
  greatestDeficitOvercome?: number;
  numPointsInLead: number;
  percentageOfGameInLead?: number;
  leads: LeadInfo[];
}

interface CurrentLead {
  lead: number;
  team1: boolean;
}
export class LeadStatistician {
  private pointCount = 0;
  private currentLead: CurrentLead = undefined;
  private lastPointState: PointState = PointState.Default;
  private leads: LeadsStats = {
    team1: {
      leads: [],
      biggest: 0,
      numPointsInLead: 0,
    },
    team2: {
      leads: [],
      biggest: 0,
      numPointsInLead: 0,
    },
    numChanges: 0,
  };

  nextPoint = (point: PointHistory) => {
    if (this.currentLead === undefined) {
      this.addNewLead(point);
    } else {
      if (this.currentLead.team1 === point.team1WonPoint) {
        this.updateLead(point.team1WonPoint, true);
      } else {
        if (this.currentLead.lead === 1) {
          this.currentLead = undefined;
        } else {
          this.updateLead(this.currentLead.team1, false);
        }
      }
    }
    this.lastPointState = point.pointState;
    this.pointCount++;
  };

  private updateLead(team1: boolean, wonPoint: boolean) {
    this.currentLead.lead += wonPoint ? 1 : -1;
    const lead = this.getCurrentTeamLead(team1);
    lead.leadingFor++;
    lead.biggestLead = Math.max(lead.biggestLead, this.currentLead.lead);
  }

  private getCurrentTeamLead(team1: boolean) {
    const leads = this.getLeads(team1);
    return leads[leads.length - 1];
  }

  private getLeads(team1: boolean): LeadInfo[] {
    return team1 ? this.leads.team1.leads : this.leads.team2.leads;
  }

  private addNewLead(point: PointHistory) {
    const leadInfo: LeadInfo = {
      fromPoint: point.team1Points + point.team2Points,
      biggestLead: 1,
      leadingFor: 1,
    };
    const leads = this.getLeads(point.team1WonPoint);
    leads.push(leadInfo);
    this.currentLead = {
      lead: 1,
      team1: point.team1WonPoint,
    };
  }

  private setBiggestLead(teamLeads: TeamLeads) {
    teamLeads.biggest = teamLeads.leads.reduce(
      (biggest, lead) => Math.max(biggest, lead.biggestLead),
      0,
    );
  }

  private setBiggestLeads() {
    this.setBiggestLead(this.leads.team1);
    this.setBiggestLead(this.leads.team2);
  }

  private setGreatestDeficitOvercome() {
    if (team1WonGameOrMatch(this.lastPointState)) {
      this.leads.team1.greatestDeficitOvercome = this.leads.team2.biggest;
    } else if (team2WonGameOrMatch(this.lastPointState)) {
      this.leads.team2.greatestDeficitOvercome = this.leads.team1.biggest;
    }
  }

  private setNumPointsInLead(teamLeads: TeamLeads) {
    teamLeads.numPointsInLead = teamLeads.leads.reduce(
      (total, lead) => total + lead.leadingFor,
      0,
    );
  }
  private setNumPointsInLeads() {
    this.setNumPointsInLead(this.leads.team1);
    this.setNumPointsInLead(this.leads.team2);
  }

  private setPointsInLeadStats() {
    this.setNumPointsInLeads();
    if (this.pointCount > 0) {
      this.leads.team1.percentageOfGameInLead =
        (this.leads.team1.numPointsInLead / this.pointCount) * 100;
      this.leads.team2.percentageOfGameInLead =
        (this.leads.team2.numPointsInLead / this.pointCount) * 100;
    }
  }

  private setNumChanges() {
    const numLeads =
      this.leads.team1.leads.length + this.leads.team2.leads.length;
    if (numLeads > 0) {
      this.leads.numChanges = numLeads - 1;
    }
  }

  private setBiggestStats() {
    this.setBiggestLeads();
    this.setGreatestDeficitOvercome();
  }

  getStats(): LeadsStats {
    this.setBiggestStats();
    this.setNumChanges();
    this.setPointsInLeadStats();
    return this.leads;
  }
}
