import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, Modal, View } from "react-native";

import { Colors } from "@/constants/theme";
import { translateText, TranslationResult } from "@/services/translate-service";

import { ThemedText } from "./themed-text";

interface Props {
  visible: boolean;
  showOriginal: boolean;
  text: string;
  onClose: () => void;
}

export const ModalTranslate: React.FC<Props> = ({
  visible,
  showOriginal,
  text,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState<TranslationResult | null>(
    null
  );

  useEffect(() => {
    if (visible && text) {
      setLoading(true);
      setTranslation(null);

      translateText(text)
        .then((result) => setTranslation(result))
        .finally(() => setLoading(false));
    }
  }, [visible, text]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 justify-center items-center pb-10 bg-black/30">
        <View
          className="w-11/12 rounded-xl p-5 shadow-lg"
          style={{ backgroundColor: Colors.backgroundTerciary }}
        >
          {/* Original text */}
          {showOriginal ? (
            <View className="flex-row mb-3">
              <ThemedText className="text-2xl">🇺🇸</ThemedText>
              <ThemedText className="text-lg font-semibold ml-2">
                {text}
              </ThemedText>
            </View>
          ) : null}

          {/* Translation block */}
          <View className="mt-3 min-h-[80px] justify-center items-center">
            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : translation ? (
              <View className="flex-row items-center justify-center">
                <View>
                  <ThemedText className="text-2xl">🇧🇷</ThemedText>
                </View>

                <View>
                  <ThemedText className="text-base ml-2">
                    {translation.translated}
                  </ThemedText>
                </View>
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
