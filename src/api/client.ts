import axios, { AxiosResponse } from 'axios';
import { IError } from 'interfaces';
import getAppConfig from '../config/appConfig';
import { IApiResponse, isApiError } from './errors';

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

function getErrorResponse(error: unknown): IError {
  if (axios.isAxiosError(error) && error.response?.data) {
    return error.response.data as IError;
  }

  return error as IError;
}

export async function requestEnvelope<T>(
  request: Promise<AxiosResponse<IApiResponse<T>>>,
): Promise<IApiResponse<T> | IError> {
  try {
    const response = await request;

    return response.data;
  } catch (error: unknown) {
    return getErrorResponse(error);
  }
}

export async function requestPayload<T>(
  request: Promise<AxiosResponse<IApiResponse<T>>>,
): Promise<T> {
  const result = await requestEnvelope<T>(request);

  if (isApiError(result)) {
    return result as T;
  }

  return result.data;
}

type QueryValue = string | number | boolean | Array<string | number | boolean> | null | undefined;

export function buildQueryString(path: string, params: Record<string, QueryValue>): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        query.set(key, value.join(','));
      }

      return;
    }

    query.set(key, String(value));
  });

  const serializedQuery = query.toString();

  return serializedQuery ? `${path}?${serializedQuery}` : path;
}

apiClient.interceptors.request.use((config) => {
  const HEADER = 'X-Request-ID';

  const headers = config.headers || {};

  if (!headers[HEADER] && !(headers as any)[HEADER.toLowerCase()]) {
    (headers as any)[HEADER] = genRequestId();
  }

  return config;
});

export default apiClient;
