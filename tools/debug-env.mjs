import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');

console.log('--- Environment Diagnostic ---');
console.log('Checking for .env file at:', envPath);

if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: .env file NOT FOUND!');
  console.log('Ensure you have a file named exactly ".env" in the root directory.');
  process.exit(1);
}

console.log('✅ .env file found.');

const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split(/\r?\n/);

console.log(`Checking ${lines.length} lines for syntax issues...`);

let hasError = false;
lines.forEach((line, index) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;

  if (!trimmed.includes('=')) {
    console.warn(`⚠️ Warning: Line ${index + 1} does not contain an "=" sign: "${line}"`);
    hasError = true;
  }

  const [key, ...rest] = trimmed.split('=');
  if (key.includes(' ')) {
    console.error(`❌ ERROR: Line ${index + 1} has a space in the key: "${key}". Keys must not have spaces.`);
    hasError = true;
  }

  const value = rest.join('=');
  if (value.startsWith(' ') || value.endsWith(' ')) {
    console.warn(`⚠️ Warning: Line ${index + 1} has leading or trailing spaces in the value. This can cause login failures.`);
  }
});

if (!hasError) {
  console.log('✅ No major syntax errors found in .env structure.');
} else {
  console.log('❌ Please fix the errors above and try again.');
}

console.log('--- End of Diagnostic ---');
