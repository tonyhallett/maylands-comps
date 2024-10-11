import { useEffect, useState } from "react";
import { Size } from "../commonTypes";

interface Meaurements {
  client: Size;
  windowInner: Size;
  windowOuter: Size;
}
// also look at https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API

function getMeasurements() {
  return {
    client: {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    },
    windowInner: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    windowOuter: {
      width: window.outerWidth,
      height: window.outerHeight,
    },
  };
}

export default function ViewportDemo() {
  const [measurements, setMeasurements] = useState<Meaurements>({
    client: { width: 0, height: 0 },
    windowInner: { width: 0, height: 0 },
    windowOuter: { width: 0, height: 0 },
  });

  useEffect(() => {
    const updateMeasurements = () => {
      setMeasurements(getMeasurements());
    };
    updateMeasurements();
    window.addEventListener("resize", updateMeasurements);
    return () => {
      window.removeEventListener("resize", updateMeasurements);
    };
  }, []);
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Measurement</th>
            <th>Width</th>
            <th>Height</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>client</td>
            <td>{measurements.client.width}</td>
            <td>{measurements.client.height}</td>
          </tr>
          <tr>
            <td>windowInner</td>
            <td>{measurements.windowInner.width}</td>
            <td>{measurements.windowInner.height}</td>
          </tr>
          <tr>
            <td>windowOuter</td>
            <td>{measurements.windowOuter.width}</td>
            <td>{measurements.windowOuter.height}</td>
          </tr>
        </tbody>
      </table>
      {new Array(100).fill(0).map((_, i) => {
        return <div key={i}>{i}</div>;
      })}
    </>
  );
}
