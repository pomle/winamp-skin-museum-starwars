function createStars(count, w, h) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const s = {
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 1000,
    };
    out.push(s);
  }
  return out;
}

export function createStarField(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const context = canvas.getContext("2d");

  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  function drawStar({ x, y, z }) {
    const intensity = z * 255;
    const rgb = "rgb(" + intensity + "," + intensity + "," + intensity + ")";
    context.fillStyle = rgb;
    context.fillRect(x, y, 1, 1);
  }

  const stars = createStars(1000, w, h);

  stars.forEach((star) => drawStar(star));

  return canvas;
}
