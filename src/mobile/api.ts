/**
 * Camada de acesso ao backend de classificação.
 *
 * Esconde a diferença entre MOCK e REAL: a tela (App.tsx) sempre chama
 * `classifyImage(uri)` e recebe o mesmo tipo `ClassificationResult`, batendo
 * exatamente com o contrato do endpoint Flask `POST /api/predict`. Trocar para
 * o backend real (Etapa 3) é só ajustar o `.env` (ver config.ts) - nenhum
 * código de tela muda.
 *
 * Observação: as chaves do objeto (`confianca`, `probabilidade_pneumonia`) são
 * mantidas SEM acento de propósito - elas precisam casar com o JSON do Flask.
 */
import { API_URL, USE_MOCK } from "./config";

/** Resposta do backend, idêntica ao JSON de `POST /api/predict`. */
export type ClassificationResult = {
  classe: "NORMAL" | "PNEUMONIA";
  /** Confiança na classe prevista, 0..1. */
  confianca: number;
  /** Probabilidade de pneumonia estimada pelo modelo, 0..1. */
  probabilidade_pneumonia: number;
};

const REQUEST_TIMEOUT_MS = 20000;
const HEALTH_TIMEOUT_MS = 4000;

/**
 * Envia a imagem ao backend e devolve a classificação.
 * Em modo MOCK, simula a resposta sem rede.
 */
export async function classifyImage(uri: string): Promise<ClassificationResult> {
  if (USE_MOCK) {
    return mockClassify();
  }

  const form = new FormData();
  // No React Native, FormData aceita { uri, name, type } para upload de arquivo.
  form.append("image", {
    uri,
    name: "xray.jpg",
    type: "image/jpeg",
  } as unknown as Blob);

  const res = await fetchWithTimeout(
    `${API_URL}/api/predict`,
    { method: "POST", body: form },
    REQUEST_TIMEOUT_MS
  );

  if (!res.ok) {
    throw new Error(`O servidor respondeu com erro (HTTP ${res.status}).`);
  }

  const data = (await res.json()) as ClassificationResult;
  return data;
}

/**
 * Verifica se o backend está acessível (`GET /api/health`).
 * Em modo MOCK retorna sempre true. Usado para o indicador de conexão da tela.
 */
export async function checkHealth(): Promise<boolean> {
  if (USE_MOCK) {
    return true;
  }
  try {
    const res = await fetchWithTimeout(
      `${API_URL}/api/health`,
      { method: "GET" },
      HEALTH_TIMEOUT_MS
    );
    return res.ok;
  } catch {
    return false;
  }
}

/** `fetch` com timeout via AbortController (suportado no React Native). */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Resposta simulada: ~1,2s de latência e resultado coerente (prob. alta => PNEUMONIA). */
async function mockClassify(): Promise<ClassificationResult> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const isPneumonia = Math.random() >= 0.5;
  const prob = isPneumonia
    ? 0.7 + Math.random() * 0.29 // 0.70..0.99
    : Math.random() * 0.3; // 0.00..0.30

  return {
    classe: isPneumonia ? "PNEUMONIA" : "NORMAL",
    probabilidade_pneumonia: round2(prob),
    confianca: round2(Math.max(prob, 1 - prob)),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
