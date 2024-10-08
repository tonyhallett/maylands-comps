import html2canvas from "html2canvas";
import { canvasToBlobAsync } from "./screenshot";

export async function testHTML2Canvas() {
  /*
    will try merging together different canvas elements
    html2canvas(document.querySelector("#capture")).then(canvas => {
    document.body.appendChild(canvas)
});
  */
  /*   interface Selectors {
    selector: Parameters<Document["querySelectorAll"]>[0];
    isAll: boolean;
  } */
  /* const selectors: Selectors[] = [
    {
      selector: `section[aria-label="Teams Selection"]`,
      isAll: false,
    },
    {
      selector: `#scoresheetTable`,
      isAll: false,
    },
    {
      selector: ".teamLabelAndSignature",
      isAll: true,
    },
  ];
 
  const canvasesPromise = Promise.all(
    selectors.map(async ({ selector, isAll }) => {
      if (isAll) {
        const elements = [...document.querySelectorAll(selector)];
        return Promise.all(
          elements.map((element: HTMLElement) => {
            return html2canvas(element, {
              backgroundColor: "black",
            });
          }),
        );
      }
      const singleElement = document.querySelector(selector) as HTMLElement;
      return Promise.all([
        html2canvas(singleElement, {
          backgroundColor: "black",
        }),
      ]);
    }),
  );
  const canvases = (await canvasesPromise).flatMap((a) => a);
  const width = Math.max(...canvases.map((canvas) => canvas.width));
  const height = canvases.reduce((acc, canvas) => acc + canvas.height, 0);
  const largeCanvas = document.createElement("canvas");
  largeCanvas.width = width;
  largeCanvas.height = height;
  const ctx = largeCanvas.getContext("2d")!;
  let y = 0;
  canvases.forEach((canvas) => {
    ctx.drawImage(canvas, 0, y);
    y += canvas.height;
  }); */
  const largeCanvas = await html2canvas(document.body, {
    ignoreElements(element) {
      const tagName = element.tagName.toLowerCase();
      if (tagName === "button" || tagName === "p") {
        return true;
      }
      return false;
    },
  });
  const blob = await canvasToBlobAsync(largeCanvas);
  navigator.clipboard.write([new ClipboardItem({ "image/png": blob! })]);
}
