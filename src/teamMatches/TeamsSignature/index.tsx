import { Divider } from "@mui/material";
import { TeamSignature, TeamSignatureProps } from "./TeamSignature";

type TeamsSignatureProps = Omit<TeamSignatureProps, "isHome" | "dataUrl"> & {
  homeDataUrl: string | undefined;
  awayDataUrl: string | undefined;
};

export function TeamsSignature(props: TeamsSignatureProps) {
  const { homeDataUrl, awayDataUrl, ...rest } = props;
  return (
    <>
      <div style={{ margin: 10 }}>
        <TeamSignature {...rest} dataUrl={homeDataUrl} isHome={true} />
      </div>
      <Divider />
      <div style={{ margin: 10 }}>
        <TeamSignature {...rest} dataUrl={awayDataUrl} isHome={false} />
      </div>
    </>
  );
}
