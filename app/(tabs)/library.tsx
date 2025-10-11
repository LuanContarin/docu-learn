import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BOOKS_MOCK = [
  {
    id: 1,
    name: "Registro 1",
    image_dir: "../../assets/images/favicon.png",
  },
  {
    id: 2,
    name: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo provident ex sequi ratione non modi maiores repellat sapiente, labore ad eius perferendis, eaque enim iure culpa architecto incidunt debitis quos!",
  },
  { id: 3, name: "Registro 3" },
  { id: 4, name: "Registro 4" },
  { id: 5, name: "Registro 5" },
  { id: 6, name: "Registro 6" },
  { id: 7, name: "Registro 7" },
  { id: 8, name: "Registro 8" },
  {
    id: 9,
    name: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis voluptatem incidunt ut consequuntur animi quisquam dignissimos, ad numquam reiciendis excepturi repudiandae? Quia, perspiciatis praesentium ex tempore fugiat illo optio voluptatibus!",
  },
  { id: 10, name: "Registro 10" },
  { id: 11, name: "Registro 11" },
  { id: 12, name: "Registro 12" },
];

export default function LibraryScreen() {
  return (
    <ThemedSafeAreaView className="flex-1">
      {/* Header */}
      <LibraryHeader />

      {/* Grid */}
      <View className="my-3">
        <LibraryGrid />
      </View>
    </ThemedSafeAreaView>
  );
}

export function LibraryHeader(): React.JSX.Element {
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");

  const onPressSearch = () => {
    setIsSearching((prev) => !prev);
    setSearchText("");
  };

  return (
    <View
      className="flex-row items-center p-3"
      style={{ backgroundColor: Colors.backgroundSecondary }}
    >
      <View className="flex-1 mr-3 h-10">
        {isSearching ? (
          <TextInput
            className="rounded-md my-auto"
            style={{
              color: Colors.text,
              textAlignVertical: "center",
            }}
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
    </View>
  );
}

export function LibraryGrid(): React.JSX.Element {
  const ITEM_HORIZONTAL_MARGIN = 4;
  const NUM_COLUMNS = 3;

  const ITEM_WIDTH =
    (SCREEN_WIDTH - ITEM_HORIZONTAL_MARGIN * 2 * NUM_COLUMNS - 32) /
    NUM_COLUMNS;

  return (
    <FlatList
      className="mx-auto"
      data={BOOKS_MOCK}
      keyExtractor={(item) => item.id.toString()}
      numColumns={NUM_COLUMNS}
      columnWrapperStyle={{
        justifyContent: "flex-start",
        marginBottom: 12,
      }}
      renderItem={({ item }) => (
        <Pressable
          className="rounded-xl overflow-hidden mx-2 relative"
          style={{
            width: ITEM_WIDTH,
            aspectRatio: 2 / 3,
            backgroundColor: Colors.backgroundTerciary,
          }}
        >
          {/* Background image or default icon */}
          {item.image_dir ? (
            <Image
              source={{ uri: item.image_dir }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons
                name="bookmark-outline"
                size={50}
                color={Colors.mutedText}
              />
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
