import { SetStateAction, useState } from "react";
import { HandicapOptions, shiftHandicap } from "../umpire/shiftHandicap";
import { MatchOptions } from "./UmpireManager";

export interface HandicapOption {
  handicap: number;
  cannotIncrement: boolean;
}
export type CompetitionType = "handicap" | "hardbat" | "normal";
export interface BestOfOption {
  bestOf: number;
  canDecrement: boolean;
}

function getCompetitionDescriptionSuffix(
  isDoubles: boolean,
  upTo: number,
  clearBy2: boolean,
  bestOf: number,
  numServes: number,
) {
  const singlesOrDoubles = isDoubles ? "Doubles" : "Singles";
  const clearByDescription = clearBy2 ? "" : " ( not 2 difference )";
  return `${singlesOrDoubles}, Best of ${bestOf}, Up to ${upTo}${clearByDescription}, ${numServes} serves`;
}

export function MatchSetup({
  setMatchOptions,
}: {
  setMatchOptions: (matchOptions: MatchOptions) => void;
}) {
  const [handicap1, setHandicap1] = useState<HandicapOption>({
    cannotIncrement: false,
    handicap: 0,
  });
  const [handicap2, setHandicap2] = useState<HandicapOption>({
    cannotIncrement: false,
    handicap: 0,
  });

  const [selectedComp, setSelectedComp] = useState<CompetitionType>("normal");
  const [shiftHandicapScore, setShiftHandicap] = useState(true);
  const [isDoubles, setIsDoubles] = useState(false);
  const [bestOfOption, setBestOfOption] = useState<BestOfOption>({
    bestOf: 3,
    canDecrement: true,
  });

  const changeHandicap = (
    increment: boolean,
    handicapOption: HandicapOption,
    setHandicapOption: React.Dispatch<SetStateAction<HandicapOption>>,
  ) => {
    if (increment) {
      const newHandicap = handicapOption.handicap + 1;
      const cannotIncrement = newHandicap === 30;
      setHandicapOption({
        handicap: newHandicap,
        cannotIncrement,
      });
    } else {
      setHandicapOption({
        handicap: handicapOption.handicap - 1,
        cannotIncrement: false,
      });
    }
  };

  return (
    <div style={{ width: 250, border: "black", borderWidth: 1 }}>
      <div style={{ marginTop: 10, marginBottom: 10 }}>
        <label>Select competition</label>
        <select
          style={{ marginLeft: 5 }}
          value={selectedComp}
          onChange={(e) => setSelectedComp(e.target.value as CompetitionType)}
        >
          <option value="normal">Normal</option>
          <option value="hardbat">Hardbat</option>
          <option value="handicap">Handicap</option>
        </select>

        {selectedComp === "handicap" ? (
          <>
            <label style={{ display: "block" }}>
              Shift negatives
              <input
                style={{ marginLeft: 10 }}
                type="checkbox"
                checked={shiftHandicapScore}
                onChange={() => setShiftHandicap(!shiftHandicapScore)}
              />
            </label>
            <div>Handicaps</div>
            <table>
              <tbody>
                <tr>
                  <td>{handicap1.handicap}</td>
                  <td>
                    <button
                      onClick={() =>
                        changeHandicap(true, handicap1, setHandicap1)
                      }
                      disabled={handicap1.cannotIncrement}
                    >
                      +
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        changeHandicap(false, handicap1, setHandicap1)
                      }
                    >
                      -
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>{handicap2.handicap}</td>
                  <td>
                    <button
                      onClick={() =>
                        changeHandicap(true, handicap2, setHandicap2)
                      }
                      disabled={handicap2.cannotIncrement}
                    >
                      +
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        changeHandicap(false, handicap2, setHandicap2)
                      }
                    >
                      -
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : null}
      </div>

      <label style={{ display: "block", marginBottom: 10 }}>
        Doubles
        <input
          type="checkbox"
          checked={isDoubles}
          onChange={() => setIsDoubles(!isDoubles)}
        />
      </label>

      <label style={{ display: "block", marginBottom: 10 }}>
        Best of {bestOfOption.bestOf}{" "}
        <button
          onClick={() =>
            setBestOfOption({
              canDecrement: true,
              bestOf: bestOfOption.bestOf + 2,
            })
          }
        >
          +
        </button>{" "}
        <button
          disabled={!bestOfOption.canDecrement}
          onClick={() => {
            const newBestOf = bestOfOption.bestOf - 2;
            setBestOfOption({
              canDecrement: newBestOf !== 1,
              bestOf: newBestOf,
            });
          }}
        >
          -
        </button>
      </label>
      <button
        onClick={() => {
          // todo - different sub type
          const newMatchOptions: MatchOptions = {
            bestOf: bestOfOption.bestOf,
            upTo: 11,
            team1StartGameScore: 0,
            team2StartGameScore: 0,
            numServes: 2,
            competitionDescription: "",
            isDoubles,
            team1Player1Name: "A Bonnici",
            team2Player1Name: "T Hallett",
            team1Player2Name: isDoubles ? "D Brown" : undefined,
            team2Player2Name: isDoubles ? "R Hucker" : undefined,
            clearBy2: false,
          };
          let prefix = "";
          switch (selectedComp) {
            case "handicap":
              // eslint-disable-next-line no-case-declarations
              let handicapOptions: HandicapOptions = {
                team1Handicap: handicap1.handicap,
                team2Handicap: handicap2.handicap,
                upTo: 31,
              };
              if (shiftHandicapScore) {
                handicapOptions = shiftHandicap(handicapOptions);
              }
              newMatchOptions.upTo = handicapOptions.upTo;
              newMatchOptions.team1StartGameScore =
                handicapOptions.team1Handicap;
              newMatchOptions.team2StartGameScore =
                handicapOptions.team2Handicap;
              newMatchOptions.numServes = 5;
              prefix = "Handicap";

              break;
            case "hardbat":
              newMatchOptions.upTo = 15;
              newMatchOptions.numServes = 5;
              prefix = "Hardbat";
              break;
            case "normal":
              newMatchOptions.clearBy2 = true;
          }
          const suffix = getCompetitionDescriptionSuffix(
            isDoubles,
            newMatchOptions.upTo,
            newMatchOptions.clearBy2,
            newMatchOptions.bestOf,
            newMatchOptions.numServes,
          );
          newMatchOptions.competitionDescription =
            prefix === "" ? suffix : `${prefix} ${suffix}`;
          setMatchOptions(newMatchOptions);
        }}
      >
        Start match
      </button>
    </div>
  );
}
