// Small composable field rules. Each rule returns an error message or ''.
// Mirrors server/src/validation/schemas.js so users see problems before submitting.

export const required =
  (message = 'This field is required.') =>
  (value) =>
    (typeof value === 'string' ? value.trim() : value) ? '' : message;

export const minLength = (n, message) => (value) =>
  value.trim().length >= n ? '' : (message ?? `Use at least ${n} characters.`);

export const maxLength = (n, message) => (value) =>
  value.trim().length <= n ? '' : (message ?? `Use at most ${n} characters.`);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const email =
  (message = 'Enter a valid email address, like name@example.com.') =>
  (value) =>
    EMAIL.test(value.trim()) ? '' : message;

export const pattern = (regex, message) => (value) => (regex.test(value) ? '' : message);

export const matches = (field, message) => (value, values) => (value === values[field] ? '' : message);

export const checked =
  (message = 'Please tick this box to continue.') =>
  (value) =>
    value ? '' : message;

// Runs rules in order and keeps the first message per field.
export function runRules(rules, values) {
  const errors = {};
  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const message = rule(values[field], values);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  }
  return errors;
}

export const PASSWORD_RULES = [
  required('Choose a password.'),
  minLength(8, 'Password needs at least 8 characters.'),
  maxLength(72, 'Password can be at most 72 characters.'),
  pattern(/[A-Za-z]/, 'Password needs at least one letter.'),
  pattern(/\d/, 'Password needs at least one number.'),
];

export const NAME_RULES = [
  required('Enter your name.'),
  minLength(2, 'Name needs at least 2 characters.'),
  maxLength(60, 'Keep your name under 60 characters.'),
];

export const EMAIL_RULES = [required('Enter your email.'), email()];
