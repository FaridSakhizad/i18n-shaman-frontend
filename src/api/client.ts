import axios from 'axios';
import getAppConfig from '../config/appConfig';

const { API_URL } = getAppConfig();

function genRequestId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  const g = globalThis.crypto?.getRandomValues?.bind(globalThis.crypto);
  if (g) {
    const b = g(new Uint8Array(16));

    // eslint-disable-next-line no-bitwise
    b[6] = (b[6] & 0x0f) | 0x40;
    // eslint-disable-next-line no-bitwise
    b[8] = (b[8] & 0x3f) | 0x80;

    // @ts-ignore
    const hex = [...b].map((n) => n.toString(16).padStart(2, '0'));
    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const HEADER = 'X-Request-ID';

  const headers = config.headers || {};

  if (!headers[HEADER] && !(headers as any)[HEADER.toLowerCase()]) {
    (headers as any)[HEADER] = genRequestId();
  }

  return config;
});

export default apiClient;
