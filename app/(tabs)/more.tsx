import Constants from "expo-constants";
import React from "react";
import { View } from "react-native";

import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";

export default function MoreScreen() {
  const appVersion = Constants.expoConfig?.version ?? "not-found";

  return (
    <ThemedSafeAreaView className="flex-1">
      <View className="items-center mt-10">
        <ThemedText className="text-lg">Versão do aplicativo</ThemedText>
        <ThemedText className="text-lg mt-1">{appVersion}</ThemedText>
      </View>
    </ThemedSafeAreaView>
  );
}
