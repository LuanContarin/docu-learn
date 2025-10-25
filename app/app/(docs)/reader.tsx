import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import Pdf, { PdfRef } from "react-native-pdf";
import { captureRef } from "react-native-view-shot";

import { ModalWordTranslate } from "@/components/modal-word-translate";
import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { Colors } from "@/constants/theme";
import { getBook } from "@/services/book-service";
import {
  isPointInsideWordBox,
  removeUnwantedCharacters,
} from "@/utils/ocr-helper-functions";
import TextRecognition, {
  CornerPoints,
} from "@react-native-ml-kit/text-recognition";

type OcrWord = {
  page: number;
  text: string;
  cornerPoints: CornerPoints;
};
export default function ReaderScreen() {
  const pdfRef = useRef<PdfRef>(null);

  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const [bookUri, setBookUri] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [ocrFullText, setOcrFullText] = useState<string>("");
  const [ocrWords, setOcrWords] = useState<OcrWord[]>([]);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupFullText, setPopupFullText] = useState("");
  const [popupWord, setPopupWord] = useState("");

  const DEBOUNCE_TIME_MS = 500;

  useEffect(() => {
    const loadBook = async () => {
      if (!bookId) return;

      try {
        const book = await getBook(bookId);
        if (!book || !book.pdfUri) {
          Alert.alert("Erro", "Não foi possível encontrar o arquivo do livro.");
          return;
        }

        setBookUri(book.pdfUri);
      } catch (err) {
        console.error(err);
      }
    };

    loadBook();
  }, [bookId]);

  // Periodically capture visible area for OCR
  useEffect(() => {
    const handler = setInterval(async () => {
      const newWords: OcrWord[] = [];

      try {
        const imageTmpFile = await takeScreenshot();
        if (!imageTmpFile) {
          setOcrWords(newWords);
          return;
        }

        const ocrResult = await TextRecognition.recognize(imageTmpFile);
        if (!ocrResult) {
          setOcrWords(newWords);
          return;
        }

        ocrResult.blocks?.forEach((block) => {
          block.lines?.forEach((line) => {
            line.elements?.forEach((el) => {
              if (el.cornerPoints) {
                newWords.push({
                  page: currentPage,
                  text: el.text,
                  cornerPoints: el.cornerPoints,
                });
              }
            });
          });
        });

        setOcrFullText(ocrResult?.text ?? "");
        setOcrWords(newWords);
      } catch (err) {
        console.error(err);
      }
    }, DEBOUNCE_TIME_MS);

    return () => clearTimeout(handler);
  }, [currentPage]);

  const takeScreenshot = () => {
    if (!pdfRef.current) return null;

    return captureRef(pdfRef, {
      format: "jpg",
      result: "tmpfile",
    }).then(
      (tmpFile) => tmpFile,
      (err) => console.error(err)
    );
  };

  const onPdfTap = (page: number, x: number, y: number) => {
    if (!ocrWords || ocrWords.length <= 0) {
      Alert.alert("Erro", "Não foi encontrada nenhuma palavra no livro.");
      return;
    }

    const tappedWord = ocrWords.find(
      (word) =>
        word.page === page &&
        word.cornerPoints &&
        isPointInsideWordBox(x, y, word.cornerPoints)
    );

    if (!tappedWord) return;

    // Show popup
    setPopupFullText(ocrFullText);
    setPopupWord(removeUnwantedCharacters(tappedWord.text));
    setPopupVisible(true);
  };

  return (
    <ThemedSafeAreaView className="flex-1">
      <View className="flex-1">
        {bookUri ? (
          <Pdf
            ref={pdfRef}
            source={{ uri: bookUri }}
            style={{ flex: 1 }}
            horizontal={true}
            enablePaging={true}
            enableDoubleTapZoom={false}
            onPageChanged={(page) => setCurrentPage(page)}
            onPageSingleTap={onPdfTap}
          />
        ) : (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            className="flex-1"
          />
        )}
      </View>

      {/* MODAL translate word */}
      <ModalWordTranslate
        visible={popupVisible}
        fullText={popupFullText}
        word={popupWord}
        onClose={() => setPopupVisible(false)}
      />
    </ThemedSafeAreaView>
  );
}
