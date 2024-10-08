import { useState, useEffect } from "react";

export interface OrientationTypeAndAngle {
  type: OrientationType;
  angle: number;
}
export function getOrientationTypeAndAngle(): OrientationTypeAndAngle {
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
