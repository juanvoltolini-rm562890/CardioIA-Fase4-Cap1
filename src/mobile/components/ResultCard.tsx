import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import type { ClassificationResult } from "../api";
import { colors, font, radius, spacing } from "../theme";
import { EcgLine } from "./EcgLine";
import { Meter } from "./Meter";

type Props = {
  result: ClassificationResult;
};

/** Painel de leitura diagnóstica: classe, linha de ECG no acento e medidores. */
export function ResultCard({ result }: Props) {
  const isPneumonia = result.classe === "PNEUMONIA";
  const accent = isPneumonia ? colors.pneumonia : colors.normal;
  const soft = isPneumonia ? colors.pneumoniaSoft : colors.normalSoft;
  const verdict = isPneumonia
    ? "Padrão compatível com pneumonia"
    : "Sem sinais de pneumonia";

  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 480,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  const animStyle = {
    opacity: enter,
    transform: [
      { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
      { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) },
    ],
  };

  return (
    <Animated.View
      style={[
        styles.panel,
        { borderColor: accent, backgroundColor: soft, shadowColor: accent },
        animStyle,
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: accent }]} />

      <View style={styles.head}>
        <Text style={styles.eyebrow}>DIAGNÓSTICO</Text>
        <Text style={styles.tagMono}>CardioIA · VGG16</Text>
      </View>

      <Text style={[styles.classe, { color: accent }]}>{result.classe}</Text>
      <Text style={styles.verdict}>{verdict}</Text>

      <View style={styles.ecg}>
        <EcgLine color={accent} height={32} speed={1800} />
      </View>

      <View style={styles.meters}>
        <Meter label="CONFIANÇA" value={result.confianca} color={accent} />
        <Meter
          label="PROB. PNEUMONIA"
          value={result.probabilidade_pneumonia}
          color={isPneumonia ? colors.pneumonia : colors.textDim}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingLeft: spacing.lg + 6,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    fontFamily: font.monoSemi,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textDim,
  },
  tagMono: {
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textDim,
  },
  classe: {
    fontFamily: font.bold,
    fontSize: 38,
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  verdict: {
    fontFamily: font.regular,
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  ecg: {
    marginVertical: spacing.md,
    opacity: 0.9,
  },
  meters: {
    gap: spacing.md,
  },
});
