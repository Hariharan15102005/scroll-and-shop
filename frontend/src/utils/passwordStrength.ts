export type StrengthLevel = 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';

export interface PasswordStrengthResult {
  score: number; // 0 (Very Weak) to 4 (Very Strong)
  label: StrengthLevel;
  color: string;
  progressBarColor: string;
  percent: number; // 0 to 100
  isMinLength: boolean;
  isNotCommon: boolean;
  hasSufficientStrength: boolean;
  hasVarietyOrPassphrase: boolean;
  feedback: string;
}

// Local blocklist of common, predictable or compromised passwords
const COMMON_PASSWORDS = new Set([
  'password123456',
  'password12345',
  'password1234',
  'password123',
  '123456789012',
  '1234567890123',
  '12345678901234',
  'qwertyuiop12',
  'qwertyuiopas',
  'asdfghjkl123',
  'zxcvbnm12345',
  'adminadmin123',
  'administrator1',
  'welcome123456',
  'letmein123456',
  'changeme123456',
  'iloveyou123456',
  'football12345',
  'monkey1234567',
  'dragon1234567',
  'master1234567',
  'supersecret12',
  'scrollshop123',
  'scrollandshop1'
]);

function isAllSameChar(str: string): boolean {
  if (!str || str.length === 0) return false;
  const first = str[0];
  for (let i = 1; i < str.length; i++) {
    if (str[i] !== first) return false;
  }
  return true;
}

export function evaluatePasswordStrength(password: string, username?: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      color: '#9ca3af',
      progressBarColor: '#e5e7eb',
      percent: 0,
      isMinLength: false,
      isNotCommon: true,
      hasSufficientStrength: false,
      hasVarietyOrPassphrase: false,
      feedback: 'Enter at least 12 characters to evaluate password strength.'
    };
  }

  const length = password.length;
  const lower = password.toLowerCase();
  const isMinLength = length >= 12;

  let isNotCommon = true;
  if (COMMON_PASSWORDS.has(lower) || isAllSameChar(password)) {
    isNotCommon = false;
  }

  if (username && username.trim().length >= 3 && lower.includes(username.trim().toLowerCase())) {
    isNotCommon = false;
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const hasSpaces = password.includes(' ');

  const varietyCount = (hasLower ? 1 : 0) + (hasUpper ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSpecial ? 1 : 0);
  const words = password.trim().split(/\s+/);
  const isMultiWordPassphrase = words.length >= 3 && length >= 16;
  const hasVarietyOrPassphrase = varietyCount >= 3 || isMultiWordPassphrase;

  if (!isMinLength || !isNotCommon) {
    return {
      score: 0,
      label: 'Very Weak',
      color: '#ef4444',
      progressBarColor: '#ef4444',
      percent: Math.min(20, Math.round((length / 12) * 20)),
      isMinLength,
      isNotCommon,
      hasSufficientStrength: false,
      hasVarietyOrPassphrase,
      feedback: !isNotCommon 
        ? 'This password is too common, predictable, or contains your username.' 
        : `Password must be at least 12 characters (${length}/12).`
    };
  }

  let score = 1; // Base score for >= 12 chars

  if (isMultiWordPassphrase) {
    score = length >= 22 ? 4 : 3;
  } else {
    if (length >= 14) score++;
    if (length >= 18) score++;
    if (varietyCount >= 3) score++;
    if (varietyCount >= 4 && (length >= 14 || hasSpaces)) score++;
  }

  // Cap score at 4
  score = Math.min(4, Math.max(1, score));

  // Downrate if purely digits or purely letters with no diversity for short lengths
  if (varietyCount <= 1 && length < 16 && !isMultiWordPassphrase) {
    score = Math.min(score, 1);
  }

  let label: StrengthLevel = 'Weak';
  let color = '#f97316'; // Orange
  let percent = 25;

  switch (score) {
    case 4:
      label = 'Very Strong';
      color = '#059669'; // Emerald
      percent = 100;
      break;
    case 3:
      label = 'Strong';
      color = '#0ea5e9'; // Blue / Sky
      percent = 75;
      break;
    case 2:
      label = 'Fair';
      color = '#eab308'; // Amber / Yellow
      percent = 50;
      break;
    case 1:
    default:
      label = 'Weak';
      color = '#f97316'; // Orange
      percent = 25;
      break;
  }

  const hasSufficientStrength = score >= 2;

  let feedback = 'Good password strength.';
  if (score === 4) feedback = 'Excellent! Highly secure passphrase / complex password.';
  else if (score === 3) feedback = 'Great password! Strong resistance against attacks.';
  else if (score === 2) feedback = 'Fair password. Consider making it longer or adding symbols.';
  else feedback = 'Weak password. Add numbers, symbols, or use multiple words.';

  return {
    score,
    label,
    color,
    progressBarColor: color,
    percent,
    isMinLength,
    isNotCommon,
    hasSufficientStrength,
    hasVarietyOrPassphrase,
    feedback
  };
}
