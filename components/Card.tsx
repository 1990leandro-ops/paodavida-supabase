import { View } from "react-native";
import { colors, radius, shadow, spacing } from "../lib/theme";

export default function Card({ children }: any) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadow,
      }}
    >
      {children}
    </View>
  );
}
