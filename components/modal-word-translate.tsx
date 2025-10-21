import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, Modal, View } from "react-native";

import { Colors } from "@/constants/theme";
import { translateWord, TranslationResult } from "@/services/translate-service";

import { ThemedText } from "./themed-text";

interface Props {
  visible: boolean;
  word: string;
  fullText?: string;
  onClose: () => void;
}

export const ModalWordTranslate: React.FC<Props> = ({
  visible,
  word,
  fullText,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState<TranslationResult | null>(
    null
  );

  useEffect(() => {
    if (visible && word) {
      setLoading(true);
      setTranslation(null);

      translateWord(word, fullText)
        .then((result) => setTranslation(result))
        .finally(() => setLoading(false));
    }
  }, [visible, word, fullText]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 justify-center items-center pb-10 bg-black/30">
        <View
          className="w-11/12 rounded-xl p-5 shadow-lg"
          style={{ backgroundColor: Colors.backgroundTerciary }}
        >
          {/* Word (English) */}
          <View className="flex-row mb-3">
            <ThemedText className="text-2xl">🇺🇸</ThemedText>
            <ThemedText className="text-lg font-semibold ml-2">
              {word}
            </ThemedText>
          </View>

          {/* Translation block */}
          <View className="mt-3 min-h-[80px] justify-center items-center">
            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : translation ? (
              <View className="flex-row items-center justify-center">
                <ThemedText className="text-2xl">🇧🇷</ThemedText>
                <ThemedText className="text-base ml-2">
                  {translation.translated}
                </ThemedText>
              </View>
            ) : (
              <ThemedText className="text-base opacity-70">
                Tradução indisponível
              </ThemedText>
            )}
          </View>

          {/* Actions */}
          <View className="flex-row justify-end mt-5">
            <Button title="Fechar" color={Colors.primary} onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};
