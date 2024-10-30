// @ts-expect-error - parcel.......
import svg from "bundle-text:./MG Logo Clean.svg";

export default function MGLogo({ width }: { width: number }) {
  return (
    <div style={{ width }}>
      <div dangerouslySetInnerHTML={{ __html: svg }}></div>
    </div>
  );
}
