import { StyleSheet, Text, View } from "react-native";
import { colors, font, radius, spacing } from "../theme";

/** Nota técnica fixa: reforça que o resultado não é diagnóstico. */
export function Disclaimer() {
  return (
    <View style={styles.box}>
      <Text style={styles.eyebrow}>⚠ AVISO</Text>
      <Text style={styles.text}>
        Uso acadêmico. A classificação é gerada por um modelo de IA e{" "}
        <Text style={styles.bold}>não substitui</Text> avaliação médica,
        diagnóstico clínico ou parecer profissional.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.warnSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(245,181,68,0.35)",
    gap: 5,
  },
  eyebrow: {
    fontFamily: font.monoSemi,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.warn,
  },
  text: {
    fontFamily: font.regular,
    color: colors.text,
    fontSize: 12.5,
    lineHeight: 19,
  },
  bold: {
    fontFamily: font.semibold,
    color: colors.warn,
  },
});
