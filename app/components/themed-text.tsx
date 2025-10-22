import { ColorValue, Text, TextProps } from "react-native";

import { Colors } from "@/constants/theme";

interface ThemedTextProps extends TextProps {
  color?: ColorValue;
}

export function ThemedText({ style, color, ...otherProps }: ThemedTextProps) {
  return (
    <Text style={[{ color: color ?? Colors.text }, style]} {...otherProps} />
  );
}
