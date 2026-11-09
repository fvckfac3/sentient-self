/**
 * Shared Sentry options. Sentry stays disabled until NEXT_PUBLIC_SENTRY_DSN is set.
 *
 * Users write about mental health and recovery, so we send stack traces and
 * route names only: no request bodies, cookies, headers, query strings, AI
 * inputs/outputs, database values, local variables or console breadcrumbs.
 */

import type * as Sentry from '@sentry/nextjs'

type SentryOptions = NonNullable<Parameters<typeof Sentry.init>[0]>

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

export const sentryOptions: SentryOptions = {
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0),
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: { request: { allow: ['user-agent', 'content-type'] }, response: false },
    httpBodies: [],
    urlQueryParams: false,
    genAI: { inputs: false, outputs: false },
    databaseQueryData: false,
    stackFrameVariables: false,
  },
  beforeBreadcrumb(breadcrumb) {
    // Console output can include user content
    return breadcrumb.category === 'console' ? null : breadcrumb
  },
  beforeSend(event) {
    if (event.request) {
      delete event.request.data
      delete event.request.cookies
      delete event.request.query_string
    }
    return event
  },
}
