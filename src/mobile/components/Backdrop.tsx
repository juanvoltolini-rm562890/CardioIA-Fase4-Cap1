import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  Path,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { colors } from "../theme";

/**
 * Plano de fundo do "instrumento": gradiente navy profundo + malha de monitor
 * + brilho radial cardio no topo. Puramente decorativo (não captura toques).
 */
export function Backdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[colors.bgDeep, colors.bg, colors.bgDeep]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern
            id="grid"
            width={34}
            height={34}
            patternUnits="userSpaceOnUse"
          >
            <Path
              d="M34 0 L0 0 0 34"
              stroke={colors.line}
              strokeOpacity={0.45}
              strokeWidth={1}
              fill="none"
            />
          </Pattern>
          <RadialGradient id="glow" cx="50%" cy="2%" rx="75%" ry="42%">
            <Stop offset="0" stopColor={colors.signal} stopOpacity={0.2} />
            <Stop offset="1" stopColor={colors.signal} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow)" />
      </Svg>
    </View>
  );
}
