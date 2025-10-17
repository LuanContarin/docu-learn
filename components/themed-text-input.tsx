import { ColorValue, TextInput, TextInputProps } from "react-native";

import { Colors } from "@/constants/theme";

interface ThemedTextInputProps extends TextInputProps {
  color?: ColorValue;
}

export function ThemedTextInput({
  style,
  color,
  ...otherProps
}: ThemedTextInputProps) {
  return (
    <TextInput
      placeholderTextColor={color ?? Colors.mutedText}
      style={[
        {
          paddingHorizontal: 10,
          textAlignVertical: "center",
          color: color ?? Colors.text,
          borderColor: color ?? Colors.primary,
        },
        style,
      ]}
      {...otherProps}
    />
  );
}
