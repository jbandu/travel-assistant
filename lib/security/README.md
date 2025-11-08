# Security Implementation

## Field-level Encryption

This application implements AES-256-GCM encryption for sensitive personal data stored in the database.

### Encrypted Fields

The following fields are automatically encrypted before storage and decrypted when retrieved:

#### Personal Information
- `phoneNumber` - User's phone number
- `emergencyContact` - Emergency contact information

#### Travel Documents
- `passportNumber` - Passport number
- `visaInfo` - Visa information
- `travelInsurancePolicy` - Travel insurance policy details

#### Accessibility Information
- `medicalConditions` - Medical conditions and health information
- `medicationRequirements` - Required medications

#### Dietary Profile
- `allergies` - Food allergies
- `specificRestrictions` - Specific dietary restrictions

### Setup

1. **Generate an encryption key:**
   ```bash
   openssl rand -base64 32
   ```

2. **Add to environment variables:**
   ```env
   ENCRYPTION_KEY=your-generated-key-here
   ```

3. **Important:**
   - NEVER commit the actual encryption key to version control
   - Use different keys for development and production
   - Store production keys securely (e.g., in Vercel environment variables)

### How It Works

#### Encryption Process (Write)
1. User submits data via API
2. API route receives plaintext data
3. Sensitive fields are encrypted using `encrypt()` function
4. Encrypted data is stored in database
5. Data is decrypted for the API response

#### Decryption Process (Read)
1. API route fetches encrypted data from database
2. Sensitive fields are decrypted using `decrypt()` function
3. Decrypted data is returned to the user

### API Usage

The encryption/decryption is handled automatically in the API routes. No changes needed in frontend code.

**Example (automatic encryption in API):**
```typescript
// In API route
import { encrypt, decrypt, encryptFields, decryptFields } from '@/lib/security/encryption';

// Encrypt single field
const encrypted = encrypt(sensitiveData);

// Decrypt single field
const decrypted = decrypt(encryptedData);

// Encrypt multiple fields
const encryptedObj = encryptFields(data, ['phoneNumber', 'emergencyContact']);

// Decrypt multiple fields
const decryptedObj = decryptFields(data, ['phoneNumber', 'emergencyContact']);
```

### Security Best Practices

1. **Key Rotation:** Periodically rotate encryption keys
2. **Access Control:** Limit who can access encrypted data
3. **Audit Logging:** Log all access to sensitive encrypted fields
4. **Backup Keys:** Securely backup encryption keys (lose the key = lose the data)
5. **Environment Separation:** Use different keys for dev/staging/prod

### Data Format in Database

Encrypted fields are stored in the format:
```
iv:authTag:encryptedData
```

All parts are hex-encoded strings. Example:
```
a1b2c3d4e5f6....:f9e8d7c6b5a4....:1234567890abcdef....
```

### Testing

The application includes a development fallback key for testing. In production, you MUST set the `ENCRYPTION_KEY` environment variable or the application will throw an error.

**Development Warning:**
```
⚠️  Using default encryption key for development. Set ENCRYPTION_KEY in production!
```

### Migration

If you need to encrypt existing data:

1. Create a migration script
2. Fetch all records with sensitive fields
3. Encrypt each field using the `encrypt()` function
4. Update records in database

Example migration script:
```typescript
// scripts/encrypt-existing-data.ts
import { PrismaClient } from '@prisma/client';
import { encrypt } from '@/lib/security/encryption';

const prisma = new PrismaClient();

async function migrateData() {
  const profiles = await prisma.personalInfo.findMany();

  for (const profile of profiles) {
    if (profile.phoneNumber && !profile.phoneNumber.includes(':')) {
      // Not encrypted yet (encrypted data contains ':')
      await prisma.personalInfo.update({
        where: { id: profile.id },
        data: {
          phoneNumber: encrypt(profile.phoneNumber),
          emergencyContact: profile.emergencyContact
            ? encrypt(profile.emergencyContact)
            : null
        }
      });
    }
  }
}

migrateData().then(() => console.log('Migration complete'));
```

### Troubleshooting

**Error: "ENCRYPTION_KEY must be set in production"**
- Set the `ENCRYPTION_KEY` environment variable in your production environment

**Error: "Failed to decrypt data"**
- Check that the encryption key matches the one used to encrypt
- Verify data format is correct (iv:authTag:encryptedData)
- Ensure data wasn't corrupted during storage

**Error: "Invalid encrypted data format"**
- Data may be stored unencrypted
- Run migration script to encrypt existing data
- Check for manual database modifications

### Performance Considerations

- Encryption adds ~1-2ms per field operation
- Minimal impact on overall API response time
- Consider caching decrypted data in memory for frequently accessed fields
- Database indexes work on encrypted data but are less effective

### Compliance

This implementation helps with:
- ✅ GDPR (Data protection)
- ✅ HIPAA (Medical data encryption)
- ✅ PCI DSS (Payment card data - if applicable)
- ✅ CCPA (California Consumer Privacy Act)

### Next Steps

Consider implementing:
1. **Rate limiting** - Prevent brute force attacks
2. **Audit logging** - Track access to sensitive data
3. **Key rotation** - Periodically rotate encryption keys
4. **Field masking** - Show partial data (e.g., last 4 digits)
5. **Role-based access** - Limit who can decrypt sensitive fields
