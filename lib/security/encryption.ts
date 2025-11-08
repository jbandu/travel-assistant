/**
 * Field-level Encryption Utilities
 * Uses AES-256-GCM for encrypting sensitive personal data
 */

import crypto from 'crypto';

// Encryption algorithm
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Get encryption key from environment
 * Falls back to a default for development (NOT for production)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY must be set in production');
    }
    // Development fallback - NOT secure for production
    console.warn('⚠️  Using default encryption key for development. Set ENCRYPTION_KEY in production!');
    return crypto.scryptSync('dev-key-change-in-production', 'salt', 32);
  }

  // Derive a 32-byte key from the environment variable
  return crypto.scryptSync(key, 'salt', 32);
}

/**
 * Encrypt a string value
 * Returns format: iv:authTag:encryptedData (all hex encoded)
 */
export function encrypt(plaintext: string | null | undefined): string | null {
  if (!plaintext) return null;

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt an encrypted string
 * Expects format: iv:authTag:encryptedData (all hex encoded)
 */
export function decrypt(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) return null;

  try {
    const key = getEncryptionKey();
    const parts = ciphertext.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypt sensitive fields in an object
 * Useful for bulk encryption of profile data
 */
export function encryptFields<T extends Record<string, any>>(
  data: T,
  fieldsToEncrypt: (keyof T)[]
): T {
  const result = { ...data };

  for (const field of fieldsToEncrypt) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = encrypt(result[field] as string) as any;
    }
  }

  return result;
}

/**
 * Decrypt sensitive fields in an object
 * Useful for bulk decryption of profile data
 */
export function decryptFields<T extends Record<string, any>>(
  data: T,
  fieldsToDecrypt: (keyof T)[]
): T {
  const result = { ...data };

  for (const field of fieldsToDecrypt) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = decrypt(result[field] as string) as any;
    }
  }

  return result;
}

/**
 * Hash sensitive data for search/comparison purposes
 * Use this for fields you need to search but also protect
 */
export function hash(value: string | null | undefined): string | null {
  if (!value) return null;

  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

/**
 * Sensitive field definitions for each model
 */
export const SENSITIVE_FIELDS = {
  travelDocuments: ['passportNumber', 'visaInfo', 'travelInsurancePolicy'],
  accessibility: ['medicalConditions', 'medicationRequirements'],
  dietary: ['allergies', 'specificRestrictions'],
  personalInfo: ['phoneNumber', 'emergencyContact'],
} as const;
