import { apiClient } from './client';

export const TRACKING_EVENTS = [
  'app_opened',
  'signup_completed',
  'email_verified',
  'login_completed',
  'project_created',
  'project_opened',
  'language_added',
  'language_switched',
  'key_created',
  'translation_updated',
  'search_used',
  'import_completed',
  'import_failed',
  'export_completed',
  'export_failed',
] as const;

export type TrackingEventName = (typeof TRACKING_EVENTS)[number];
export type TrackingProperties = Record<string, string | number | boolean | null>;

interface ITrackEventPayload {
  event: TrackingEventName;
  properties?: TrackingProperties;
}

export async function trackEvent(event: TrackingEventName, properties?: TrackingProperties): Promise<void> {
  const payload: ITrackEventPayload = {
    event,
    properties,
  };

  try {
    await apiClient.post('/track', payload);
  } catch {
    // Tracking should never block the editor flow.
  }
}
