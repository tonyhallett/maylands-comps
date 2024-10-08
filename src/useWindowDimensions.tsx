import { useCallback, useEffect, useState } from "react";

export interface WindowDimensions {
  innerWidth: number;
  innerHeight: number;
  outerWidth: number;
  outerHeight: number;
}

export default function useWindowDimensions(): WindowDimensions {
  const getWindowDimensions = useCallback(() => {
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
    };
  }, []);

  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions(),
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getWindowDimensions]);

  return windowDimensions;
}
