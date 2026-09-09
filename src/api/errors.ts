import { IError } from 'interfaces';

export interface IApiResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  requestId?: string;
  correlationId?: string;
  path?: string;
  timestamp?: string;
  version?: string;
}

export function isApiError(value: unknown): value is IError {
  return Boolean(
    value
    && typeof value === 'object'
    && 'title' in value
    && 'status' in value
    && 'code' in value,
  );
}

export function isApiResponse<T = unknown>(value: unknown): value is IApiResponse<T> {
  return Boolean(
    value
    && typeof value === 'object'
    && 'success' in value
    && 'data' in value
    && (value as { success?: unknown }).success === true,
  );
}

export function unwrapApiResponse<T>(value: T | IApiResponse<T>): T {
  return isApiResponse<T>(value) ? value.data : value;
}

export function getApiErrorMessage(value: unknown, fallback: string): string {
  if (!isApiError(value)) {
    return fallback;
  }

  return value.errors?.[0]?.message || value.detail || value.title || fallback;
}

export function getApiErrorStatus(value: unknown): number | null {
  return isApiError(value) ? value.status : null;
}
