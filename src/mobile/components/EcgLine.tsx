import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { colors } from "../theme";

const PW = 150; // largura de um batimento
const H = 48; // altura do traçado
const MID = H / 2;

// Traçado estilizado de ECG (P-QRS-T) com largura PW.
const BEAT = `M0 ${MID} H52 L60 18 L66 ${MID} L70 30 L74 7 L78 39 L82 ${MID} L96 19 L110 ${MID} H${PW}`;

type Props = {
  color?: string;
  /** ms para percorrer um batimento (menor = mais rápido). */
  speed?: number;
  height?: number;
};

/** Linha de ECG que rola continuamente, como num monitor cardíaco. */
export function EcgLine({ color = colors.signal, speed = 2200, height = H }: Props) {
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(x, {
        toValue: 1,
        duration: speed,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [speed, x]);

  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [0, -PW] });

  return (
    <View style={[styles.clip, { height }]}>
      <Animated.View style={{ width: PW * 2, height, transform: [{ translateX }] }}>
        <Svg width={PW * 2} height={height} viewBox={`0 0 ${PW * 2} ${H}`}>
          {[0, PW].map((offset) => (
            <G key={offset} x={offset}>
              <Path
                d={BEAT}
                stroke={color}
                strokeOpacity={0.22}
                strokeWidth={6}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d={BEAT}
                stroke={color}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </G>
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    width: "100%",
    overflow: "hidden",
  },
});
