const TRACKING_EVENTS = new Set([
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
]);

const MAX_BODY_BYTES = 8192;
const MAX_PROPERTIES = 24;
const MAX_STRING_LENGTH = 160;

function isAuthorized(request, env) {
  if (!env.TRACKING_PROVIDER_SECRET) {
    return true;
  }

  return request.headers.get('x-tracking-provider-secret') === env.TRACKING_PROVIDER_SECRET;
}

function corsHeaders(env) {
  return {
    'access-control-allow-origin': env.ALLOWED_ORIGIN || '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };
}

function jsonResponse(data, init = {}, env = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      ...corsHeaders(env),
      ...(init.headers || {}),
    },
  });
}

function isSafePropertyKey(key) {
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(key);
}

function isSafePropertyValue(value) {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

function sanitizeProperties(properties) {
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
    return {};
  }

  return Object.entries(properties)
    .slice(0, MAX_PROPERTIES)
    .reduce((result, [key, value]) => {
      if (!isSafePropertyKey(key) || !isSafePropertyValue(value)) {
        return result;
      }

      result[key] = typeof value === 'string' ? value.slice(0, MAX_STRING_LENGTH) : value;

      return result;
    }, {});
}

function getNumber(properties, key) {
  return typeof properties[key] === 'number' && Number.isFinite(properties[key])
    ? properties[key]
    : 0;
}

function getString(properties, key) {
  return typeof properties[key] === 'string' ? properties[key] : '';
}

function writeAnalyticsPoint(env, request, productEvent, properties) {
  if (!env.ANALYTICS) {
    return;
  }

  const country = request.cf?.country || 'unknown';
  const projectId = getString(properties, 'project_id');

  env.ANALYTICS.writeDataPoint({
    blobs: [
      productEvent,
      env.ENVIRONMENT || 'production',
      projectId,
      getString(properties, 'import_type'),
      getString(properties, 'format'),
      getString(properties, 'entity_type'),
      getString(properties, 'surface'),
      country,
    ],
    doubles: [
      1,
      getNumber(properties, 'language_count'),
      getNumber(properties, 'key_count'),
      getNumber(properties, 'file_count'),
      getNumber(properties, 'query_length'),
      getNumber(properties, 'values_count'),
    ],
    indexes: [projectId || productEvent],
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(env),
      });
    }

    const url = new URL(request.url);

    if (request.method !== 'POST' || url.pathname !== '/track') {
      return jsonResponse({ error: 'Not Found' }, { status: 404 }, env);
    }

    if (!isAuthorized(request, env)) {
      return jsonResponse({ error: 'Unauthorized' }, { status: 401 }, env);
    }

    const contentLength = Number(request.headers.get('content-length') || 0);

    if (contentLength > MAX_BODY_BYTES) {
      return jsonResponse({ error: 'Payload Too Large' }, { status: 413 }, env);
    }

    let payload;

    try {
      payload = await request.json();
    } catch (error) {
      console.warn(JSON.stringify({
        event: 'tracking_event_rejected',
        reason: 'invalid_json',
        error: error instanceof Error ? error.message : String(error),
      }));

      return jsonResponse({ error: 'Bad Request' }, { status: 400 }, env);
    }

    if (!payload || !TRACKING_EVENTS.has(payload.event)) {
      return jsonResponse({ error: 'Invalid Tracking Event' }, { status: 400 }, env);
    }

    const properties = sanitizeProperties(payload.properties);

    console.log(JSON.stringify({
      event: 'product_event',
      productEvent: payload.event,
      environment: env.ENVIRONMENT || 'production',
      userId: typeof payload.userId === 'string' ? payload.userId : undefined,
      properties,
    }));

    writeAnalyticsPoint(env, request, payload.event, properties);

    return jsonResponse({ ok: true }, {}, env);
  },
};
