import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { colors, font, radius } from "../theme";

type Props = {
  /** 0..1 */
  value: number;
  color: string;
  label: string;
};

/** Mostrador horizontal animado (estilo gauge de instrumento). */
export function Meter({ value, color, label }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: Math.max(0, Math.min(1, value)),
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value, progress]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });
  const pct = Math.round(value * 100);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>
          {pct}
          <Text style={styles.unit}>%</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width,
              backgroundColor: color,
              shadowColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 7,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  label: {
    fontFamily: font.monoMed,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.textDim,
  },
  value: {
    fontFamily: font.monoBold,
    fontSize: 17,
  },
  unit: {
    fontFamily: font.monoMed,
    fontSize: 11,
  },
  track: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
});
