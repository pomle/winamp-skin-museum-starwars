export function scale(image, factor) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width * factor;
  canvas.height = image.height * factor;

  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas;
}
