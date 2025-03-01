export const hexToRgb = (color: string) => {
  const parts = color.replace("#", "").match(/.{1,2}/g);
  return parts ? parts.map(part => parseInt(part, 16)) : [];
} 