// @ts-expect-error - this is a hack to get the svg file to be included in the bundle
import svg from "bundle-text:./MG Logo Clean.svg";

export default function MGLogo({ width }: { width: number }) {
  return (
    <div style={{ width }}>
      <div dangerouslySetInnerHTML={{ __html: svg }}></div>
    </div>
  );
}
