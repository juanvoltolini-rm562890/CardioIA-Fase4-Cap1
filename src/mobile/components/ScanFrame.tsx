import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, font, radius, spacing } from "../theme";

type Props = {
  children: ReactNode;
  /** Cor dos colchetes (muda quando há imagem/resultado). */
  accent?: string;
  label?: string;
};

const SIZE = 26;
const THICK = 2;

/** Visor estilo scanner: moldura com colchetes nos cantos e etiqueta técnica. */
export function ScanFrame({ children, accent = colors.lineBright, label }: Props) {
  return (
    <View style={styles.frame}>
      <View style={styles.inner}>{children}</View>

      <Corner accent={accent} style={styles.tl} />
      <Corner accent={accent} style={styles.tr} />
      <Corner accent={accent} style={styles.bl} />
      <Corner accent={accent} style={styles.br} />

      {label ? (
        <View style={[styles.tag, { borderColor: accent }]}>
          <Text style={[styles.tagText, { color: accent }]}>{label}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Corner({ accent, style }: { accent: string; style: object }) {
  return <View style={[styles.corner, { borderColor: accent }, style]} />;
}

const styles = StyleSheet.create({
  frame: {
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  inner: {
    flex: 1,
    overflow: "hidden",
    borderRadius: radius.lg,
  },
  corner: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
  },
  tl: { top: 10, left: 10, borderTopWidth: THICK, borderLeftWidth: THICK, borderTopLeftRadius: 6 },
  tr: { top: 10, right: 10, borderTopWidth: THICK, borderRightWidth: THICK, borderTopRightRadius: 6 },
  bl: { bottom: 10, left: 10, borderBottomWidth: THICK, borderLeftWidth: THICK, borderBottomLeftRadius: 6 },
  br: { bottom: 10, right: 10, borderBottomWidth: THICK, borderRightWidth: THICK, borderBottomRightRadius: 6 },
  tag: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: "rgba(7,10,18,0.7)",
  },
  tagText: {
    fontFamily: font.monoSemi,
    fontSize: 10,
    letterSpacing: 1.5,
  },
});
