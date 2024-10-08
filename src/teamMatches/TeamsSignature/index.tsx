import { Divider } from "@mui/material";
import { TeamSignature, TeamSignatureProps } from "./TeamSignature";
import { useRef } from "react";

type TeamsSignatureProps = Omit<TeamSignatureProps, "isHome">;
interface HasSigned {
  home: boolean;
  away: boolean;
}
export function TeamsSignature(props: TeamsSignatureProps) {
  const hasSignedRef = useRef<HasSigned>({ home: false, away: false });

  const callHasSigned = () => {
    props.setHasSigned?.(
      hasSignedRef.current.home && hasSignedRef.current.away,
    );
  };
  return (
    <>
      <div style={{ margin: 10 }}>
        <TeamSignature
          {...props}
          setHasSigned={(homeSigned) => {
            hasSignedRef.current.home = homeSigned;
            callHasSigned();
          }}
          isHome={true}
        />
      </div>
      <Divider />
      <div style={{ margin: 10 }}>
        <TeamSignature
          {...props}
          setHasSigned={(awaySigned) => {
            hasSignedRef.current.away = awaySigned;
            callHasSigned();
          }}
          isHome={false}
        />
      </div>
    </>
  );
}
