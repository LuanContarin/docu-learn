import { CornerPoints } from "@react-native-ml-kit/text-recognition";

const BLACKLISTED_CHARACTERS = [".", ","];

export function isPointInsideWordBox(
  x: number,
  y: number,
  wordBox: CornerPoints
): boolean {
  if (!x || !y || !wordBox) return false;

  let inside = false;
  for (let i = 0, j = wordBox.length - 1; i < wordBox.length; j = i++) {
    const xi = wordBox[i].x,
      yi = wordBox[i].y;
    const xj = wordBox[j].x,
      yj = wordBox[j].y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

export function removeUnwantedCharacters(text: string): string {
  let cleaned = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (!BLACKLISTED_CHARACTERS.includes(char)) {
      cleaned += char;
    }
  }

  return cleaned.trim();
}
