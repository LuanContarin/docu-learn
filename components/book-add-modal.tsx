import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Button, Image, Modal, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/theme";

import { ThemedText } from "./themed-text";
import { ThemedTextInput } from "./themed-text-input";

interface Props {
  visible: boolean;
  onConfirm: (name: string, coverUri?: string) => void;
  onCancel: () => void;
}

export const BookAddModal: React.FC<Props> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  const [bookName, setBookName] = useState("");
  const [coverUri, setCoverUri] = useState<string | undefined>(undefined);

  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      setCoverUri("");
    }

    setCoverUri(result.assets?.[0].uri);
  };

  const onPressCancel = () => {
    setBookName("");
    setCoverUri("");
    onCancel();
  };

  const onPressConfirm = () => {
    onConfirm(bookName, coverUri);
    setBookName("");
    setCoverUri("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-center p-5">
        <View
          className="rounded-2xl p-6"
          style={{ backgroundColor: Colors.backgroundTerciary }}
        >
          <ThemedText className="text-xl font-bold mb-5">
            Adicionar livro
          </ThemedText>

          <ThemedTextInput
            className="border-2 rounded-lg mb-3"
            placeholder="Nome do livro..."
            value={bookName}
            onChangeText={setBookName}
          />

          <TouchableOpacity className="mx-auto mb-3" onPress={pickCover}>
            {coverUri ? (
              <Image
                className="rounded-lg"
                width={100}
                height={150}
                source={{ uri: coverUri }}
              />
            ) : (
              <View
                className="rounded-lg w-36 aspect-cover justify-center items-center"
                style={{
                  backgroundColor: Colors.inactive,
                }}
              >
                <ThemedText>Capa (opcional)</ThemedText>
              </View>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-end gap-5">
            <Button
              title="Cancelar"
              color={Colors.primary}
              onPress={onPressCancel}
            />
            <Button
              title="Confirmar"
              color={Colors.primary}
              onPress={onPressConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
