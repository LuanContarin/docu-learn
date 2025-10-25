import { Image } from "react-native";

export function getImageSize(
  uri: string
): Promise<{ imgWidth: number; imgHeight: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ imgWidth: width, imgHeight: height }),
      (err) => reject(err)
    );
  });
}
