import { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { colors, font, radius, spacing } from "../theme";

type Variant = "primary" | "secondary";

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
};

/** Botão estilo instrumento: rótulo monoespaçado, escala ao toque e brilho no primário. */
export function ActionButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}: Props) {
  const isPrimary = variant === "primary";
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  const press = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => !isDisabled && press(0.97)}
        onPressOut={() => press(1)}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={[
          styles.base,
          isPrimary ? styles.primary : styles.secondary,
          isDisabled ? styles.disabled : null,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={isPrimary ? colors.bg : colors.textHi} />
        ) : (
          <Text
            style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.signal,
    shadowColor: colors.signal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  secondary: {
    backgroundColor: "rgba(15,22,38,0.7)",
    borderWidth: 1,
    borderColor: colors.lineBright,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontFamily: font.monoBold,
    fontSize: 14,
    letterSpacing: 2,
    textAlign: "center",
  },
  primaryLabel: {
    color: colors.bg,
  },
  secondaryLabel: {
    color: colors.textHi,
  },
});
