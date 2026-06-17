import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { useFonts } from "expo-font";
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from "@expo-google-fonts/ibm-plex-sans";
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
  IBMPlexMono_700Bold,
} from "@expo-google-fonts/ibm-plex-mono";

import { checkHealth, classifyImage, type ClassificationResult } from "./api";
import { API_URL, USE_MOCK } from "./config";
import { ActionButton } from "./components/ActionButton";
import { Backdrop } from "./components/Backdrop";
import { Disclaimer } from "./components/Disclaimer";
import { EcgLine } from "./components/EcgLine";
import { ResultCard } from "./components/ResultCard";
import { ScanFrame } from "./components/ScanFrame";
import { StatusBadge } from "./components/StatusBadge";
import { colors, font, radius, spacing } from "./theme";

type Status = "idle" | "loading" | "done" | "error";

const TOP_PADDING =
  Platform.OS === "android" ? (RNStatusBar.currentHeight ?? 24) + spacing.md : 60;

export default function App() {
  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
    IBMPlexMono_700Bold,
  });

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);

  // Indicador de conexão com o backend (em modo MOCK fica sempre "ok").
  useEffect(() => {
    let active = true;
    checkHealth().then((ok) => {
      if (active) setOnline(ok);
    });
    return () => {
      active = false;
    };
  }, []);

  function selectImage(uri: string) {
    setImageUri(uri);
    setResult(null);
    setErrorMsg(null);
    setStatus("idle");
  }

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setStatus("error");
      setErrorMsg(
        "Permissão da galeria negada. Habilite o acesso às fotos nas configurações do dispositivo."
      );
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (!res.canceled && res.assets?.[0]) {
      selectImage(res.assets[0].uri);
    }
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setStatus("error");
      setErrorMsg(
        "Permissão da câmera negada. Habilite o acesso à câmera nas configurações do dispositivo."
      );
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (!res.canceled && res.assets?.[0]) {
      selectImage(res.assets[0].uri);
    }
  }

  async function classify() {
    if (!imageUri) return;
    setStatus("loading");
    setErrorMsg(null);
    try {
      const r = await classifyImage(imageUri);
      setResult(r);
      setStatus("done");
    } catch (err) {
      const base =
        err instanceof Error ? err.message : "Falha ao classificar a imagem.";
      const hint = USE_MOCK
        ? ""
        : "\n\nVerifique se o backend Flask está rodando, se o IP em .env está correto e se o celular está na mesma rede Wi-Fi.";
      setStatus("error");
      setErrorMsg(base + hint);
    }
  }

  function reset() {
    setImageUri(null);
    setResult(null);
    setErrorMsg(null);
    setStatus("idle");
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <Backdrop />
        <View style={{ width: "70%" }}>
          <EcgLine height={56} speed={1400} />
        </View>
        <Text style={styles.loaderText}>CARREGANDO</Text>
      </View>
    );
  }

  const isLoading = status === "loading";
  const frameAccent =
    status === "done" && result
      ? result.classe === "PNEUMONIA"
        ? colors.pneumonia
        : colors.normal
      : imageUri
      ? colors.signal
      : colors.lineBright;

  const badge = USE_MOCK
    ? { color: colors.mock, label: "MODO DEMONSTRAÇÃO" }
    : online === null
    ? { color: colors.textDim, label: "VERIFICANDO…" }
    : online
    ? { color: colors.online, label: "BACKEND ONLINE" }
    : { color: colors.offline, label: "BACKEND OFFLINE" };

  return (
    <View style={styles.root}>
      <Backdrop />
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Reveal index={0}>
          <StatusBadge color={badge.color} label={badge.label} />
        </Reveal>

        <Reveal index={1} style={styles.header}>
          <Text style={styles.eyebrow}>ASSISTENTE · VISÃO COMPUTACIONAL</Text>
          <Text style={styles.title}>CardioIA</Text>
          <View style={styles.heroEcg}>
            <EcgLine height={40} speed={2000} />
          </View>
          <Text style={styles.hint}>
            Selecione uma radiografia de tórax para classificar como{" "}
            <Text style={styles.hintNormal}>NORMAL</Text> ou{" "}
            <Text style={styles.hintPneu}>PNEUMONIA</Text>.
          </Text>
        </Reveal>

        <Reveal index={2}>
          <ScanFrame accent={frameAccent} label="RAIO-X · TÓRAX">
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.fill} resizeMode="cover" />
            ) : (
              <View style={styles.empty}>
                <View style={styles.emptyEcg}>
                  <EcgLine color={colors.line} height={36} speed={2800} />
                </View>
                <Text style={styles.emptyText}>AGUARDANDO RADIOGRAFIA</Text>
              </View>
            )}
          </ScanFrame>
        </Reveal>

        <Reveal index={3} style={styles.pickerRow}>
          <View style={styles.cell}>
            <ActionButton
              label="CÂMERA"
              variant="secondary"
              onPress={takePhoto}
              disabled={isLoading}
            />
          </View>
          <View style={styles.cell}>
            <ActionButton
              label="GALERIA"
              variant="secondary"
              onPress={pickFromGallery}
              disabled={isLoading}
            />
          </View>
        </Reveal>

        <Reveal index={4}>
          <ActionButton
            label={isLoading ? "PROCESSANDO" : "ANALISAR"}
            onPress={classify}
            disabled={!imageUri || isLoading}
            loading={isLoading}
          />
        </Reveal>

        {status === "done" && result ? (
          <View style={styles.resultGroup}>
            <ResultCard result={result} />
            <Disclaimer />
            <ActionButton label="NOVA ANÁLISE" variant="secondary" onPress={reset} />
          </View>
        ) : null}

        {status === "error" && errorMsg ? (
          <View style={styles.resultGroup}>
            <View style={styles.errorBox}>
              <Text style={styles.errorEyebrow}>✕ FALHA</Text>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
            <ActionButton label="NOVA ANÁLISE" variant="secondary" onPress={reset} />
          </View>
        ) : null}

        <Text style={styles.footer}>GRUPO 72 · FIAP · FASE 4</Text>
      </ScrollView>
    </View>
  );
}

/** Wrapper de entrada: fade + subida, com atraso escalonado por índice. */
function Reveal({
  index = 0,
  children,
  style,
}: {
  index?: number;
  children: ReactNode;
  style?: object;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 520,
      delay: index * 90,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [index, v]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loader: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  loaderText: {
    color: colors.textDim,
    fontSize: 13,
    letterSpacing: 4,
  },
  content: {
    paddingTop: TOP_PADDING,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  eyebrow: {
    fontFamily: font.monoSemi,
    fontSize: 11,
    letterSpacing: 2.5,
    color: colors.signal,
  },
  title: {
    fontFamily: font.bold,
    fontSize: 46,
    letterSpacing: -1,
    color: colors.textHi,
    marginTop: 2,
  },
  heroEcg: {
    marginVertical: spacing.xs,
  },
  hint: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
  hintNormal: {
    fontFamily: font.semibold,
    color: colors.normal,
  },
  hintPneu: {
    fontFamily: font.semibold,
    color: colors.pneumonia,
  },
  fill: {
    width: "100%",
    height: "100%",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  emptyEcg: {
    width: "60%",
    opacity: 0.7,
  },
  emptyText: {
    fontFamily: font.monoMed,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.textDim,
  },
  pickerRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cell: {
    flex: 1,
  },
  resultGroup: {
    gap: spacing.lg,
  },
  errorBox: {
    backgroundColor: colors.pneumoniaSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.pneumonia,
    padding: spacing.md,
    gap: 6,
  },
  errorEyebrow: {
    fontFamily: font.monoSemi,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.pneumonia,
  },
  errorText: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  footer: {
    fontFamily: font.mono,
    textAlign: "center",
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textDim,
    marginTop: spacing.sm,
  },
});
