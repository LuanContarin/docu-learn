import { View, ViewProps } from "react-native";

import { Colors } from "@/constants/theme";

interface ThemedViewProps extends ViewProps {
  backgroundColor?: string;
}

export function ThemedView({
  style,
  backgroundColor,
  ...otherProps
}: ThemedViewProps) {
  return (
    <View
      style={[{ backgroundColor: backgroundColor ?? Colors.background }, style]}
      {...otherProps}
    />
  );
}
