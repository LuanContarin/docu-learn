import { ThemedSafeAreaView } from "@/components/themed-safe-area-view";
import { ThemedText } from "@/components/themed-text";

export default function ReaderScreen() {
  return (
    <ThemedSafeAreaView className="flex-1">
      <ThemedText className="text-xl font-semibold">
        Reader Screen – here the file will be shown
      </ThemedText>
    </ThemedSafeAreaView>
  );
}
