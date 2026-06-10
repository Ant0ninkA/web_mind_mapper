const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;
const USERNAME_MIN = 3;
const USERNAME_MAX = 32;
const PASSWORD_MIN = 8;

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function checkEmail(value: unknown, errs: string[]): void {
  if (value === undefined) {
    errs.push('email is required');
    return;
  }
  if (!isString(value) || !EMAIL_RE.test(value)) {
    errs.push('email is invalid');
  }
}

function checkUsername(value: unknown, errs: string[]): void {
  if (!isString(value)) {
    errs.push('username must be a string');
    return;
  }
  if (value.length < USERNAME_MIN || value.length > USERNAME_MAX) {
    errs.push(`username must be between ${USERNAME_MIN} and ${USERNAME_MAX} characters`);
  }
  if (!USERNAME_RE.test(value)) {
    errs.push('username may only contain letters, digits, and underscore');
  }
}

export function validateRegister(body: Record<string, unknown>): string[] {
  const errs: string[] = [];
  checkEmail(body.email, errs);
  if (body.username === undefined) errs.push('username is required');
  else checkUsername(body.username, errs);
  if (body.password === undefined) errs.push('password is required');
  else if (!isString(body.password) || body.password.length < PASSWORD_MIN) {
    errs.push(`password must be at least ${PASSWORD_MIN} characters`);
  }
  return errs;
}

export function validateLogin(body: Record<string, unknown>): string[] {
  const errs: string[] = [];
  if (body.email === undefined) errs.push('email is required');
  if (body.password === undefined) errs.push('password is required');
  return errs;
}

