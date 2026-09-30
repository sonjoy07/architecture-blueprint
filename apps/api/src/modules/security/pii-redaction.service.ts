import { Injectable, Logger } from '@nestjs/common';

export type PiiType = 'EMAIL' | 'PHONE' | 'SSN_NID' | 'CREDIT_CARD';

export interface PiiDetectionRecord {
  type: PiiType;
  count: number;
  redactedCharacters: number;
  maskedSamples: string[];
}

export interface RedactionAuditReport {
  originalCharacterCount: number;
  sanitizedCharacterCount: number;
  piiDetected: boolean;
  totalDetections: number;
  totalRedactedCharacters: number;
  breakdown: Record<PiiType, PiiDetectionRecord>;
  processedAt: string;
}

export interface RedactionResult {
  cleanText: string;
  auditReport: RedactionAuditReport;
}

@Injectable()
export class PiiRedactionService {
  private readonly logger = new Logger(PiiRedactionService.name);

  // Regex: RFC 5322 compliant email pattern
  private static readonly EMAIL_REGEX =
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

  // Regex: International E.164 & Bangladesh formats
  // Matches: +8801712345678, 8801812345678, 01912345678, 013/014/015/016/017/018/019 with hyphens/spaces
  // Also matches international numbers like +1-800-555-0199, +44 20 7946 0950
  private static readonly PHONE_REGEX =
    /(?:(?:\+?880|880)[\s-]?)?01[3-9]\d{2}[\s-]?\d{6}\b|\b(?:\+?[1-9]\d{0,2}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/g;

  // Regex: US SSN (\b\d{3}-\d{2}-\d{4}\b) and Bangladesh National ID (NID)
  // BD Smart Card NID: 10 digits
  // BD Old Format NID: 13 digits or 17 digits (with 4-digit birth year prefix)
  private static readonly SSN_NID_REGEX =
    /\b(?:\d{3}-\d{2}-\d{4}|\b(?:19\d{2}|20\d{2})\d{13}\b|\b\d{17}\b|\b\d{13}\b|\b\d{10}\b)\b/g;

  // Candidate Credit Card patterns (13 to 19 digits with spaces/dashes)
  private static readonly CREDIT_CARD_CANDIDATE_REGEX =
    /\b(?:\d[ -]*?){13,19}\b/g;

  /**
   * Sanitizes input text by detecting and replacing PII entities with standard tokens.
   * Generates a structured audit report for compliance verification.
   */
  public redact(text: string): RedactionResult {
    if (!text || typeof text !== 'string') {
      return {
        cleanText: text || '',
        auditReport: this.createEmptyAuditReport(0),
      };
    }

    const originalLength = text.length;
    let sanitized = text;

    const breakdown: Record<PiiType, PiiDetectionRecord> = {
      CREDIT_CARD: { type: 'CREDIT_CARD', count: 0, redactedCharacters: 0, maskedSamples: [] },
      SSN_NID: { type: 'SSN_NID', count: 0, redactedCharacters: 0, maskedSamples: [] },
      PHONE: { type: 'PHONE', count: 0, redactedCharacters: 0, maskedSamples: [] },
      EMAIL: { type: 'EMAIL', count: 0, redactedCharacters: 0, maskedSamples: [] },
    };

    // 1. Credit Card Redaction (with mandatory Luhn algorithm verification)
    sanitized = sanitized.replace(PiiRedactionService.CREDIT_CARD_CANDIDATE_REGEX, (match) => {
      const digitsOnly = match.replace(/\D/g, '');
      if (digitsOnly.length >= 13 && digitsOnly.length <= 19 && this.passesLuhnCheck(digitsOnly)) {
        breakdown.CREDIT_CARD.count += 1;
        breakdown.CREDIT_CARD.redactedCharacters += match.length;
        if (breakdown.CREDIT_CARD.maskedSamples.length < 5) {
          breakdown.CREDIT_CARD.maskedSamples.push(this.maskCreditCard(digitsOnly));
        }
        return '[REDACTED_CREDIT_CARD]';
      }
      return match;
    });

    // 2. SSN and Bangladesh NID Redaction
    sanitized = sanitized.replace(PiiRedactionService.SSN_NID_REGEX, (match) => {
      // Check that it's not preceded by a decimal or inside an already redacted token
      if (match.includes('[REDACTED_')) return match;

      const digits = match.replace(/\D/g, '');
      // Validate SSN structure (not all zeros in any group)
      if (match.includes('-')) {
        const parts = match.split('-');
        if (parts[0] === '000' || parts[0] === '666' || parts[0].startsWith('9')) return match;
        if (parts[1] === '00' || parts[2] === '0000') return match;
      }

      breakdown.SSN_NID.count += 1;
      breakdown.SSN_NID.redactedCharacters += match.length;
      if (breakdown.SSN_NID.maskedSamples.length < 5) {
        breakdown.SSN_NID.maskedSamples.push(this.maskGeneralId(match));
      }
      return '[REDACTED_SSN_NID]';
    });

    // 3. Phone Number Redaction (BD + International)
    sanitized = sanitized.replace(PiiRedactionService.PHONE_REGEX, (match) => {
      if (match.includes('[REDACTED_')) return match;

      const digitsOnly = match.replace(/\D/g, '');
      // Ensure sufficient length to qualify as a phone number
      if (digitsOnly.length < 7 || digitsOnly.length > 15) return match;

      breakdown.PHONE.count += 1;
      breakdown.PHONE.redactedCharacters += match.length;
      if (breakdown.PHONE.maskedSamples.length < 5) {
        breakdown.PHONE.maskedSamples.push(this.maskPhone(match));
      }
      return '[REDACTED_PHONE]';
    });

    // 4. Email Redaction
    sanitized = sanitized.replace(PiiRedactionService.EMAIL_REGEX, (match) => {
      breakdown.EMAIL.count += 1;
      breakdown.EMAIL.redactedCharacters += match.length;
      if (breakdown.EMAIL.maskedSamples.length < 5) {
        breakdown.EMAIL.maskedSamples.push(this.maskEmail(match));
      }
      return '[REDACTED_EMAIL]';
    });

    const totalDetections = Object.values(breakdown).reduce((sum, item) => sum + item.count, 0);
    const totalRedactedChars = Object.values(breakdown).reduce(
      (sum, item) => sum + item.redactedCharacters,
      0,
    );

    const auditReport: RedactionAuditReport = {
      originalCharacterCount: originalLength,
      sanitizedCharacterCount: sanitized.length,
      piiDetected: totalDetections > 0,
      totalDetections,
      totalRedactedCharacters: totalRedactedChars,
      breakdown,
      processedAt: new Date().toISOString(),
    };

    return {
      cleanText: sanitized,
      auditReport,
    };
  }

  /**
   * Luhn Algorithm (Mod 10 Check) for validating Credit Card numbers.
   * Prevents false-positive redactions on random serial numbers.
   */
  private passesLuhnCheck(digits: string): boolean {
    let sum = 0;
    let shouldDouble = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  // --------------------------------------------------------------------------
  // Audit Trail Masking Helpers (One-way non-reversible masking)
  // --------------------------------------------------------------------------

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '***@redacted.com';
    const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : '***';
    return `${maskedLocal}@${domain}`;
  }

  private maskPhone(phone: string): string {
    const clean = phone.replace(/[\s-]/g, '');
    if (clean.length <= 4) return '***-***';
    return `${clean.slice(0, 3)}****${clean.slice(-3)}`;
  }

  private maskCreditCard(digits: string): string {
    return `****-****-****-${digits.slice(-4)}`;
  }

  private maskGeneralId(idStr: string): string {
    if (idStr.length <= 4) return '***';
    return `${idStr.slice(0, 2)}***${idStr.slice(-2)}`;
  }

  private createEmptyAuditReport(length: number): RedactionAuditReport {
    return {
      originalCharacterCount: length,
      sanitizedCharacterCount: length,
      piiDetected: false,
      totalDetections: 0,
      totalRedactedCharacters: 0,
      breakdown: {
        CREDIT_CARD: { type: 'CREDIT_CARD', count: 0, redactedCharacters: 0, maskedSamples: [] },
        SSN_NID: { type: 'SSN_NID', count: 0, redactedCharacters: 0, maskedSamples: [] },
        PHONE: { type: 'PHONE', count: 0, redactedCharacters: 0, maskedSamples: [] },
        EMAIL: { type: 'EMAIL', count: 0, redactedCharacters: 0, maskedSamples: [] },
      },
      processedAt: new Date().toISOString(),
    };
  }
}
