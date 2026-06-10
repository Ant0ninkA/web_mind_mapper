import { validateRegister, validateLogin } from './user';

describe('validateRegister', () => {
  it('passes for valid input', () => {
    expect(
      validateRegister({ email: 'a@b.co', username: 'ivan_p', password: 'supersecret' }),
    ).toEqual([]);
  });

  it('rejects missing fields', () => {
    const errs = validateRegister({});
    expect(errs).toContain('email is required');
    expect(errs).toContain('username is required');
    expect(errs).toContain('password is required');
  });

  it('rejects bad email', () => {
    const errs = validateRegister({ email: 'not-email', username: 'ivan', password: 'supersecret' });
    expect(errs).toContain('email is invalid');
  });

  it('rejects username with bad chars', () => {
    const errs = validateRegister({ email: 'a@b.co', username: 'iv an', password: 'supersecret' });
    expect(errs.some((e) => e.includes('username'))).toBe(true);
  });

  it('rejects username too short', () => {
    const errs = validateRegister({ email: 'a@b.co', username: 'iv', password: 'supersecret' });
    expect(errs.some((e) => e.includes('username'))).toBe(true);
  });

  it('rejects short password', () => {
    const errs = validateRegister({ email: 'a@b.co', username: 'ivan', password: 'short' });
    expect(errs).toContain('password must be at least 8 characters');
  });
});

describe('validateLogin', () => {
  it('passes for valid input', () => {
    expect(validateLogin({ email: 'a@b.co', password: 'whatever' })).toEqual([]);
  });

  it('rejects missing fields', () => {
    const errs = validateLogin({});
    expect(errs).toContain('email is required');
    expect(errs).toContain('password is required');
  });
});

