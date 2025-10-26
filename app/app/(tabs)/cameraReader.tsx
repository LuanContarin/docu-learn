import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  GestureResponderEvent,
  Image,
  LayoutChangeEvent,
  Linking,
  Pressable,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";

import { ModalTranslate } from "@/components/modal-translate";
import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { getImageSize } from "@/utils/image-helper-functions";
import {
  isPointInsideWordBox,
  removeUnwantedCharacters,
} from "@/utils/ocr-helper-functions";
import TextRecognition, {
  CornerPoints,
} from "@react-native-ml-kit/text-recognition";

type OcrWord = {
  text: string;
  cornerPoints: CornerPoints;
};
export default function CameraReaderScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");

  const cameraRef = useRef<Camera>(null);
  const imageRef = useRef<View>(null);

  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0 });

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [popupShowOriginal, setPopupShowOriginal] = useState(false);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  const takeScreenshot = () => {
    if (!imageRef.current) return null;

    return captureRef(imageRef, {
      format: "jpg",
      result: "tmpfile",
    }).then(
      (tmpFile) => tmpFile,
      (err) => console.error(err)
    );
  };

  const onTakePhoto = async () => {
    if (isTakingPhoto) return;

    setIsTakingPhoto(true);
    try {
      const photo = await cameraRef.current?.takePhoto();
      if (!photo?.path) {
        setIsTakingPhoto(false);
        return;
      }

      setPhotoPath(`file://${photo.path}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const onRetakePicture = () => {
    setPhotoPath(null);
    setIsTakingPhoto(false);
  };

  const onImageLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setImageLayout({ width, height });
  };

  const onTapImage = async (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;

    try {
      const imageTmpFile = await takeScreenshot();
      if (!imageTmpFile) return;

      const { imgWidth, imgHeight } = await getImageSize(imageTmpFile);

      const scaleX = imgWidth / imageLayout.width;
      const scaleY = imgHeight / imageLayout.height;

      const tapX = locationX * scaleX;
      const tapY = locationY * scaleY;

      const ocrResult = await TextRecognition.recognize(imageTmpFile);
      if (!ocrResult) return;

      let tappedWord: OcrWord | null = null;
      for (const block of ocrResult.blocks ?? []) {
        for (const line of block.lines ?? []) {
          for (const el of line.elements ?? []) {
            if (
              el.cornerPoints &&
              isPointInsideWordBox(tapX, tapY, el.cornerPoints)
            ) {
              tappedWord = {
                text: el.text,
                cornerPoints: el.cornerPoints,
              };
              break;
            }
          }
        }
      }
      if (!tappedWord) return;

      // Show popup
      setPopupText(removeUnwantedCharacters(tappedWord.text));
      setPopupShowOriginal(true);
      setPopupVisible(true);
    } catch (err) {
      console.error(err);
    }
  };

  const onTranslateTextTap = async () => {
    try {
      const imageTmpFile = await takeScreenshot();
      if (!imageTmpFile) return;

      const ocrResult = await TextRecognition.recognize(imageTmpFile);
      if (!ocrResult) return;

      if (!ocrResult.text) {
        Alert.alert("Erro", "Não foi encontrado nenhum texto na imagem.");
        return;
      }

      // Show popup
      setPopupText(ocrResult.text);
      setPopupShowOriginal(false);
      setPopupVisible(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (hasPermission === false) {
    return (
      <ThemedSafeAreaView className="flex-1 items-center justify-center">
        <ThemedText className="font-bold text-lg">Permissão negada</ThemedText>
        <ThemedText className="mb-5">Acesso à câmera não concedido</ThemedText>
        <Button
          title="Configurações"
          color={Colors.primary}
          onPress={Linking.openSettings}
        />
      </ThemedSafeAreaView>
    );
  }

  if (!device) {
    return (
      <ThemedSafeAreaView className="flex-1 items-center justify-center">
        <ThemedText className="font-bold text-lg">
          Dispositivo não compatível
        </ThemedText>
      </ThemedSafeAreaView>
    );
  }

  return (
    <ThemedSafeAreaView className="flex-1">
      <View className="flex-1">
        {photoPath ? (
          <Pressable className="flex-1" onPress={onTapImage}>
            <View
              className="flex-1"
              ref={imageRef}
              collapsable={false}
              onLayout={onImageLayout}
            >
              <Image
                className="w-full h-full"
                source={{ uri: photoPath }}
                resizeMode="contain"
              />
            </View>
          </Pressable>
        ) : (
          <Camera
            ref={cameraRef}
            style={{ flex: 1 }}
            device={device}
            isActive={true}
            photo={true}
            resizeMode="contain"
          />
        )}
      </View>

      {!photoPath && (
        <Pressable
          className="items-center justify-center rounded-lg py-4 m-4"
          disabled={isTakingPhoto}
          onPress={onTakePhoto}
          style={{
            backgroundColor: Colors.primary,
            opacity: isTakingPhoto ? 0.6 : 1,
          }}
        >
          <ThemedText className="font-bold text-lg">
            {isTakingPhoto ? "Capturando..." : "Capturar"}
          </ThemedText>
        </Pressable>
      )}

      {photoPath && (
        <View className="flex-row gap-4 px-4 pb-6">
          <Pressable
            className="flex-1 py-5 rounded-lg items-center justify-center"
            onPress={onRetakePicture}
            style={{ backgroundColor: Colors.primary }}
          >
            <ThemedText className="font-bold text-lg">Tirar outra</ThemedText>
          </Pressable>

          <Pressable
            className="flex-1 py-5 rounded-lg items-center justify-center"
            onPress={onTranslateTextTap}
            style={{ backgroundColor: Colors.primary }}
          >
            <ThemedText className="font-bold text-lg">
              Traduzir texto
            </ThemedText>
          </Pressable>
        </View>
      )}

      <ModalTranslate
        visible={popupVisible}
        text={popupText}
        showOriginal={popupShowOriginal}
        onClose={() => setPopupVisible(false)}
      />
    </ThemedSafeAreaView>
  );
}
