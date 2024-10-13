import { useRef, useState } from "react";

export interface SignatureDataUrls {
  home: string | undefined;
  away: string | undefined;
}
export interface SignatureRequirement {
  lastCompleted: boolean | undefined;
  requiresNewSignature: boolean;
}
export function useSignatureRequirement() {
  const [signatureDataUrls, setSignatureDataUrls] = useState<SignatureDataUrls>(
    {
      home: undefined,
      away: undefined,
    },
  );
  const signatureRequirementRef = useRef<SignatureRequirement>({
    lastCompleted: undefined,
    requiresNewSignature: false,
  });
  const signatureRequirement = signatureRequirementRef.current;
  const addedSignature = (dataUrl: string, isHome: boolean) => {
    signatureRequirement.requiresNewSignature = false;
    setSignatureDataUrls((prevState) => {
      return {
        ...prevState,
        [isHome ? "home" : "away"]: dataUrl,
      };
    });
  };
  const setCompleted = (leagueMatchCompleted: boolean) => {
    if (signatureRequirement.lastCompleted && !leagueMatchCompleted) {
      signatureRequirement.requiresNewSignature = true;
    }
    signatureRequirement.lastCompleted = leagueMatchCompleted;
    return getDataUrls();
  };
  const getDataUrls = () => {
    let homeDataUrl = signatureDataUrls.home;
    let awayDataUrl = signatureDataUrls.away;
    if (signatureRequirement.requiresNewSignature) {
      homeDataUrl = undefined;
      awayDataUrl = undefined;
    }
    return {
      homeDataUrl,
      awayDataUrl,
    };
  };

  return { addedSignature, setCompleted };
}
