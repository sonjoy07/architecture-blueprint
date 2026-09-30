import pino, { Logger as PinoLogger, LoggerOptions } from 'pino';
import { Injectable, LoggerService } from '@nestjs/common';

// ----------------------------------------------------------------------------
// Sensitive Key Paths for Automated Object Redaction
// ----------------------------------------------------------------------------
const REDACT_PATHS = [
  // HTTP Headers
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["set-cookie"]',
  'req.headers["x-api-key"]',
  'req.headers["x-tenant-api-token"]',
  'headers.authorization',
  'headers.cookie',
  'headers["x-api-key"]',

  // Authentication & Secrets
  'password',
  '*.password',
  'token',
  '*.token',
  'accessToken',
  '*.accessToken',
  'refreshToken',
  '*.refreshToken',
  'secret',
  '*.secret',
  'clientSecret',
  '*.clientSecret',
  'apiKey',
  '*.apiKey',
  'privateKey',
  '*.privateKey',

  // Identity & Card credentials
  'creditCard',
  '*.creditCard',
  'cardNumber',
  '*.cardNumber',
  'cvv',
  '*.cvv',
  'ssn',
  '*.ssn',
  'nid',
  '*.nid',
];

// Regex for string message sanitization
const STRING_PATTERNS = [
  { regex: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, replacement: 'Bearer [REDACTED_TOKEN]' },
  { regex: /(api[-_]?key|secret|password)\s*[:=]\s*['"]?[^\s,'"]+['"]?/gi, replacement: '$1: [REDACTED]' },
  { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replacement: '[REDACTED_EMAIL]' },
  { regex: /(?:(?:\+?880|880)[\s-]?)?01[3-9]\d{2}[\s-]?\d{6}\b/g, replacement: '[REDACTED_PHONE]' },
  { regex: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[REDACTED_SSN]' },
  { regex: /\b(?:\d[ -]*?){13,19}\b/g, replacement: '[REDACTED_CARD]' },
];

/**
 * Sanitizes plain string log messages before emitting to stdout.
 */
function sanitizeMessage(msg: string): string {
  if (typeof msg !== 'string') return msg;
  let result = msg;
  for (const { regex, replacement } of STRING_PATTERNS) {
    result = result.replace(regex, replacement);
  }
  return result;
}

/**
 * Maps standard Pino numerical levels to GCP Cloud Logging severity strings.
 */
const PINO_LEVEL_TO_GCP_SEVERITY: Record<number, string> = {
  10: 'DEBUG',
  20: 'DEBUG',
  30: 'INFO',
  40: 'WARNING',
  50: 'ERROR',
  60: 'CRITICAL',
};

const pinoOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  // Ensure synchronous or buffered stdout stream
  redact: {
    paths: REDACT_PATHS,
    censor: '[REDACTED_BY_POLICY]',
  },
  formatters: {
    level(label, number) {
      // GCP Cloud Logging severity field mapping
      return {
        severity: PINO_LEVEL_TO_GCP_SEVERITY[number] || 'INFO',
        level: number,
      };
    },
    log(obj) {
      // Deep traverse string messages if present
      if (typeof obj.msg === 'string') {
        obj.msg = sanitizeMessage(obj.msg);
      }
      return obj;
    },
  },
  messageKey: 'message',
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  base: {
    service: 'enterprise-knowledge-copilot-api',
    env: process.env.NODE_ENV || 'development',
  },
};

export const rawPinoLogger: PinoLogger = pino(pinoOptions);

/**
 * Enterprise SecureLogger implementing NestJS LoggerService.
 * Can be passed to `app.useLogger(app.get(SecureLogger))` in main.ts.
 */
@Injectable()
export class SecureLogger implements LoggerService {
  private readonly logger: PinoLogger;

  constructor() {
    this.logger = rawPinoLogger;
  }

  log(message: any, ...optionalParams: any[]): void {
    this.callPino('info', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]): void {
    this.callPino('error', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): void {
    this.callPino('warn', message, optionalParams);
  }

  debug?(message: any, ...optionalParams: any[]): void {
    this.callPino('debug', message, optionalParams);
  }

  verbose?(message: any, ...optionalParams: any[]): void {
    this.callPino('trace', message, optionalParams);
  }

  private callPino(
    level: 'info' | 'error' | 'warn' | 'debug' | 'trace',
    message: any,
    optionalParams: any[],
  ): void {
    let context: string | undefined;
    let extraMeta: Record<string, any> = {};

    // Extract NestJS context string if provided as last param
    if (optionalParams.length > 0) {
      const last = optionalParams[optionalParams.length - 1];
      if (typeof last === 'string') {
        context = last;
      } else if (typeof last === 'object') {
        extraMeta = last;
      }
    }

    if (typeof message === 'object' && message !== null) {
      this.logger[level]({ context, ...extraMeta, ...message });
    } else {
      const sanitized = typeof message === 'string' ? sanitizeMessage(message) : message;
      this.logger[level]({ context, ...extraMeta }, sanitized);
    }
  }
}
