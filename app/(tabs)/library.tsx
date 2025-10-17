import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";

import { BookAddModal } from "@/components/book-add-modal";
import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { Colors } from "@/constants/theme";
import { Book } from "@/models/book";
import { getBooks, pickAndAddBook } from "@/services/book-service";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function LibraryScreen() {
  const [books, setBooks] = useState<Book[]>([]);

  const fetchBooks = useCallback(async (search?: string) => {
    try {
      const foundBooks = await getBooks(search);
      setBooks(foundBooks);
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Falha ao carregar os livros.");
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return (
    <ThemedSafeAreaView className="flex-1">
      {/* Header */}
      <LibraryHeader
        onSearch={(term) => fetchBooks(term)}
        onAdd={() => fetchBooks()}
      />

      {/* Grid */}
      <View className="my-3 mx-auto">
        <LibraryGrid books={books} />
      </View>
    </ThemedSafeAreaView>
  );
}

type LibraryHeaderProps = {
  onSearch: (term: string) => void;
  onAdd: () => void;
};
export function LibraryHeader({
  onSearch,
  onAdd,
}: LibraryHeaderProps): React.JSX.Element {
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [modalAddBookVisible, setModalAddBookVisible] = useState(false);
  const [modalConfirmCallback, setModalConfirmCallback] = useState<
    ((name: string, coverUri?: string) => void) | null
  >(null);

  const DEBOUNCE_TIME = 300; // ms debounce

  useEffect(() => {
    const handler = setTimeout(() => {
      if (isSearching) {
        onSearch(searchText.trim());
      }
    }, DEBOUNCE_TIME);

    return () => clearTimeout(handler);
  }, [searchText, isSearching, onSearch]);

  const onPressSearch = () => {
    if (isSearching) {
      setIsSearching(false);
      setSearchText("");
      onSearch("");
      return;
    }

    setIsSearching(true);
  };

  const onPressAddBook = async () => {
    const newBook = await pickAndAddBook((onConfirm) => {
      setModalConfirmCallback(() => (name: string, corverUri?: string) => {
        onConfirm(name, corverUri);
      });
      setModalAddBookVisible(true);
    });

    if (newBook) {
      Alert.alert("Sucesso", `"${newBook.name}" foi adicionado.`);
      onAdd();
    }
  };

  return (
    <>
      {/* HEADER */}
      <View
        className="flex-row items-center p-3"
        style={{ backgroundColor: Colors.backgroundSecondary }}
      >
        <View className="flex-1 mr-3 h-10">
          {isSearching ? (
            <ThemedTextInput
              className="rounded-lg my-auto"
              placeholder="Pesquisar..."
              placeholderTextColor={Colors.mutedText}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
          ) : (
            <ThemedText className="text-4xl my-auto">Biblioteca</ThemedText>
          )}
        </View>

        <View className="my-auto">
          <TouchableOpacity onPress={onPressSearch}>
            <Ionicons
              name={isSearching ? "arrow-back" : "search"}
              size={30}
              color={Colors.text}
            />
          </TouchableOpacity>
        </View>
        {isSearching ? null : (
          <View className="my-auto ms-3">
            <TouchableOpacity onPress={onPressAddBook}>
              <Ionicons name="add-circle" size={30} color={Colors.text} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* MODAL add book */}
      <BookAddModal
        visible={modalAddBookVisible}
        onConfirm={(name, coverUri) => {
          if (modalConfirmCallback) {
            modalConfirmCallback(name, coverUri);
          }
          setModalAddBookVisible(false);
          setModalConfirmCallback(null);
        }}
        onCancel={() => {
          setModalAddBookVisible(false);
          setModalConfirmCallback(null);
        }}
      />
    </>
  );
}

type LibraryGridProps = {
  books: Book[];
};
export function LibraryGrid({ books }: LibraryGridProps): React.JSX.Element {
  const NUM_COLUMNS = 3;
  const ITEM_WIDTH = (SCREEN_WIDTH - 4 * 2 * NUM_COLUMNS - 32) / NUM_COLUMNS;

  if (!books || books.length <= 0) {
    return (
      <View className="items-center mt-3">
        <ThemedText>Nenhum livro encontrado</ThemedText>
        <ThemedText>Aperte no botão "+" para adicionar</ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={books}
      keyExtractor={(item) => item.id.toString()}
      numColumns={NUM_COLUMNS}
      columnWrapperStyle={{
        justifyContent: "flex-start",
        marginBottom: 12,
      }}
      renderItem={({ item }) => (
        <Pressable
          className="rounded-xl overflow-hidden aspect-cover mx-2 relative"
          style={{
            width: ITEM_WIDTH,
            backgroundColor: Colors.backgroundTerciary,
          }}
          onPress={() =>
            router.push({
              pathname: "/(docs)/reader",
              params: { bookId: item.id },
            })
          }
        >
          {/* Background image or default icon */}
          {item.coverUri ? (
            <Image
              source={{ uri: item.coverUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="image" size={50} color={Colors.mutedText} />
            </View>
          )}

          {/* Overlay with gradient and title */}
          <View className="absolute bottom-0 left-0 right-0">
            <View className="p-2">
              <ThemedText
                className="text-white text-xs font-medium"
                numberOfLines={2}
              >
                {item.name}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}
