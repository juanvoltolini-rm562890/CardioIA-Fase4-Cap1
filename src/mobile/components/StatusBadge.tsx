import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { colors, font, radius, spacing } from "../theme";

type Props = {
  color: string;
  label: string;
  pulse?: boolean;
};

/** Pílula de status com ponto luminoso pulsante. */
export function StatusBadge({ color, label, pulse = true }: Props) {
  const a = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 0.25, duration: 700, useNativeDriver: true }),
        Animated.timing(a, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, a]);

  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Animated.View
        style={[styles.dot, { backgroundColor: color, shadowColor: color, opacity: a }]}
      />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: "rgba(11,17,32,0.6)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontFamily: font.monoSemi,
    fontSize: 11,
    letterSpacing: 1.3,
  },
});
