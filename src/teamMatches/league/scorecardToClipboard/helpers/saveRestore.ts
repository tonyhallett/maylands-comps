export const saveRestore = <T>(ctx: CanvasRenderingContext2D, fn: () => T) => {
  ctx.save();
  const t = fn();
  ctx.restore();
  return t;
};
