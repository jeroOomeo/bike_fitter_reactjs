export const drawPoint = (ctx, x, y, r, color) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
};

export const drawSegment = (ctx, [kx, ky], [cx, cy], color) => {
  ctx.beginPath();
  ctx.moveTo(kx, ky);
  ctx.lineTo(cx, cy);
  ctx.lineWidth = 4;
  ctx.strokeStyle = color;
  ctx.stroke();
};
