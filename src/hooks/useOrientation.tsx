import { useState, useEffect } from "react";
export function isPortrait() {
  return window.screen.orientation.type.startsWith("portrait");
}

export function useOrientation() {
  const [portrait, setPortrait] = useState<boolean>(isPortrait());
  useEffect(() => {
    const orientation = window.screen.orientation;
    const updatePortrait = () => {
      setPortrait(isPortrait());
    };
    orientation.addEventListener("change", updatePortrait);
    return () => orientation.removeEventListener("change", updatePortrait);
  }, []);
  return portrait;
}

interface OrientationTypeAndAngle {
  type: OrientationType;
  angle: number;
}
function getOrientationTypeAndAngle(): OrientationTypeAndAngle {
  return {
    type: window.screen.orientation.type,
    angle: window.screen.orientation.angle,
  };
}
export function useOrientationTypeAndAngle() {
  const [orientationTypeAndAngle, setOrientationTypeAndAngle] =
    useState<OrientationTypeAndAngle>(getOrientationTypeAndAngle());
  useEffect(() => {
    const orientation = window.screen.orientation;
    const updateOrientationType = () => {
      setOrientationTypeAndAngle(getOrientationTypeAndAngle());
    };
    orientation.addEventListener("change", updateOrientationType);
    return () =>
      orientation.removeEventListener("change", updateOrientationType);
  }, []);
  return orientationTypeAndAngle;
}
