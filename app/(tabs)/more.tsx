import Constants from "expo-constants";
import React from "react";
import { Button, View } from "react-native";

import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { deleteBook, getBooks } from "@/services/book-service";

export default function MoreScreen() {
  const appVersion = Constants.expoConfig?.version ?? "not-found";

  const onPressDeleteAllBooks = async () => {
    const books = await getBooks();
    if (!books || books.length <= 0) return;

    for (const book of books) {
      await deleteBook(book.id);
    }
  };

  return (
    <ThemedSafeAreaView className="flex-1">
      <View className="items-center my-10">
        <ThemedText className="text-lg">Versão do aplicativo</ThemedText>
        <ThemedText className="text-lg mt-1">{appVersion}</ThemedText>
      </View>

      <View className="items-center">
        <ThemedText className="text-lg">
          ⚠️ATENÇÃO: USAR APENAS SE NECESSÁRIO
        </ThemedText>
        <Button
          title="Apagar todos os livros"
          color={Colors.primary}
          onPress={onPressDeleteAllBooks}
        />
      </View>
    </ThemedSafeAreaView>
  );
}
