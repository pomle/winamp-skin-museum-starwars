export function clamp(value, min, max) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    max;
  }
  return value;
}

export function lerp(position, start, end) {
  const len = end - start;
  return clamp((position - start) / len, 0, 1);
}
