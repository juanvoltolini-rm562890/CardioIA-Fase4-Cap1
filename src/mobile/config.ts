/**
 * Configuração do backend e do modo de execução.
 *
 * MODO MOCK (padrão): o app responde com classificações simuladas, sem precisar
 * do backend Flask. Útil para desenvolver e demonstrar a interface antes da
 * integração (Etapa 3 do plano de trabalho).
 *
 * MODO REAL: crie um arquivo `.env` (copie de `.env.example`) com:
 *   EXPO_PUBLIC_USE_MOCK=false
 *   EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:5050
 * Descubra o IP da máquina que roda o Flask (Windows: `ipconfig` -> IPv4).
 * Celular e máquina precisam estar na mesma rede Wi-Fi.
 *
 * As variáveis EXPO_PUBLIC_* são injetadas pelo Expo em tempo de build.
 */
export const USE_MOCK: boolean =
  (process.env.EXPO_PUBLIC_USE_MOCK ?? "true").toLowerCase() === "true";

export const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.0.100:5050";
