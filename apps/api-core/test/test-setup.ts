import 'reflect-metadata';

if (!process.env.PII_ENCRYPTION_KEY) {
  process.env.PII_ENCRYPTION_KEY = '12345678901234567890123456789012';
}
