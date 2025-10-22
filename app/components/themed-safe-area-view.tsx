import { ViewProps } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";

interface ThemedSafeAreaViewProps extends ViewProps {
  backgroundColor?: string;
}

export function ThemedSafeAreaView({
  style,
  backgroundColor,
  ...otherProps
}: ThemedSafeAreaViewProps) {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[
          { backgroundColor: backgroundColor ?? Colors.background },
          style,
        ]}
        {...otherProps}
      ></SafeAreaView>
    </SafeAreaProvider>
  );
}
