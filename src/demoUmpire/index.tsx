import { SetStateAction, useState } from "react";
import { HandicapOptions, shiftHandicap } from "../umpire/shiftHandicap";

interface HandicapOption {
  handicap: number;
  cannotIncrement: boolean;
}
type CompetitionType = "handicap" | "hardbat" | "normal";
interface BestOfOption {
  bestOf: number;
  canDecrement: boolean;
}

interface MatchOptions {
  upTo: number;
  bestOf: number;
  team1StartGameScore: number;
  team2StartGameScore: number;
  numServes: number;
}
export function DemoUmpire() {
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
  const [matchOptions, setMatchOptions] = useState<MatchOptions | undefined>(
    undefined,
  );

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
    <div>
      <h2>Handicaps</h2>
      <table>
        <tbody>
          <tr>
            <td>{handicap1.handicap}</td>
            <td>
              <button
                onClick={() => changeHandicap(true, handicap1, setHandicap1)}
                disabled={handicap1.cannotIncrement}
              >
                +
              </button>
            </td>
            <td>
              <button
                onClick={() => changeHandicap(false, handicap1, setHandicap1)}
              >
                -
              </button>
            </td>
          </tr>
          <tr>
            <td>{handicap2.handicap}</td>
            <td>
              <button
                onClick={() => changeHandicap(true, handicap2, setHandicap2)}
                disabled={handicap2.cannotIncrement}
              >
                +
              </button>
            </td>
            <td>
              <button
                onClick={() => changeHandicap(false, handicap2, setHandicap2)}
              >
                -
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <select
        value={selectedComp}
        onChange={(e) => setSelectedComp(e.target.value as CompetitionType)}
      >
        <option value="normal">Normal</option>
        <option value="hardbat">Hardbat</option>
        <option value="handicap">Handicap</option>
      </select>

      {selectedComp === "handicap" ? (
        <label>
          Shift negatives
          <input
            type="checkbox"
            checked={shiftHandicapScore}
            onChange={() => setShiftHandicap(!shiftHandicapScore)}
          />
        </label>
      ) : null}
      <br />
      <label>
        Doubles
        <input
          type="checkbox"
          checked={isDoubles}
          onChange={() => setIsDoubles(!isDoubles)}
        />
      </label>
      <br />
      <label>
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
      <br />
      <button
        onClick={() => {
          const newMatchOptions: MatchOptions = {
            bestOf: bestOfOption.bestOf,
            upTo: 11,
            team1StartGameScore: 0,
            team2StartGameScore: 0,
            numServes: 2,
          };
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
              break;
            case "hardbat":
              newMatchOptions.upTo = 15;
              newMatchOptions.numServes = 5;
              break;
          }
          setMatchOptions(newMatchOptions);
        }}
      >
        Start match
      </button>
      {matchOptions && <div>Todo</div>}
    </div>
  );
}
