import {
  validateRegister,
  validateLogin,
  validatePatchProfile,
  validatePatchPassword,
} from './user';

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

describe('validatePatchProfile', () => {
  it('passes when no fields are sent', () => {
    expect(validatePatchProfile({})).toEqual([]);
  });

  it('passes for valid username', () => {
    expect(validatePatchProfile({ username: 'new_name' })).toEqual([]);
  });

  it('rejects bad username', () => {
    expect(validatePatchProfile({ username: 'x x' }).length).toBeGreaterThan(0);
  });

  it('accepts null avatarUrl', () => {
    expect(validatePatchProfile({ avatarUrl: null })).toEqual([]);
  });

  it('rejects non-string avatarUrl', () => {
    expect(validatePatchProfile({ avatarUrl: 123 as unknown as string }).length).toBeGreaterThan(0);
  });
});

describe('validatePatchPassword', () => {
  it('passes for valid input', () => {
    expect(
      validatePatchPassword({ oldPassword: 'oldpass12', newPassword: 'newpass12' }),
    ).toEqual([]);
  });

  it('rejects missing oldPassword', () => {
    expect(validatePatchPassword({ newPassword: 'newpass12' })).toContain(
      'oldPassword is required',
    );
  });

  it('rejects short newPassword', () => {
    expect(
      validatePatchPassword({ oldPassword: 'oldpass12', newPassword: 'short' }),
    ).toContain('newPassword must be at least 8 characters');
  });
});
