/**
 * Sistema visual do app CardioIA - direção "monitor cardíaco / instrumento clínico".
 *
 * Tema escuro tipo painel de diagnóstico: fundo navy quase-preto, malha de
 * monitor, linha de ECG e acento vermelho-arterial. Resultado é lido como um
 * mostrador clínico (verde calibrado = NORMAL, vermelho de alerta = PNEUMONIA).
 */
export const colors = {
  // Fundo e superfícies (camadas do "instrumento")
  bg: "#070A12",
  bgDeep: "#04060C",
  surface: "#0F1626",
  surfaceAlt: "#0B1120",
  line: "#1B2740",
  lineBright: "#2B3C5E",

  // Texto
  textHi: "#EAF0FB",
  text: "#A7B6D3",
  textDim: "#5E6E8C",

  // Acento cardio (linha de ECG, marca)
  signal: "#FF2E55",
  signalSoft: "rgba(255,46,85,0.16)",
  signalGlow: "rgba(255,46,85,0.40)",

  // Estados de resultado
  normal: "#27E0A3",
  normalSoft: "rgba(39,224,163,0.14)",
  normalGlow: "rgba(39,224,163,0.35)",
  pneumonia: "#FF5C4D",
  pneumoniaSoft: "rgba(255,92,77,0.15)",
  pneumoniaGlow: "rgba(255,92,77,0.38)",

  // Sinalização
  warn: "#F5B544",
  warnSoft: "rgba(245,181,68,0.14)",
  online: "#27E0A3",
  offline: "#FF5C4D",
  mock: "#F5B544",
} as const;

/** Famílias de fonte (IBM Plex). Carregadas via useFonts em App.tsx. */
export const font = {
  bold: "IBMPlexSans_700Bold",
  semibold: "IBMPlexSans_600SemiBold",
  medium: "IBMPlexSans_500Medium",
  regular: "IBMPlexSans_400Regular",
  mono: "IBMPlexMono_400Regular",
  monoMed: "IBMPlexMono_500Medium",
  monoSemi: "IBMPlexMono_600SemiBold",
  monoBold: "IBMPlexMono_700Bold",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 44,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;
