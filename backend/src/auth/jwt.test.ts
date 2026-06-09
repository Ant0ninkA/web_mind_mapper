import { signAuthToken, verifyAuthToken } from './jwt';

describe('jwt', () => {
  it('signs and verifies a token round-trip', () => {
    const token = signAuthToken('user-123');
    const payload = verifyAuthToken(token);
    expect(payload.sub).toBe('user-123');
    expect(typeof payload.iat).toBe('number');
    expect(typeof payload.exp).toBe('number');
  });

  it('produces an exp ~24h in the future', () => {
    const token = signAuthToken('user-123');
    const { exp, iat } = verifyAuthToken(token);
    expect(exp - iat).toBe(24 * 60 * 60);
  });

  it('throws on a tampered token', () => {
    const token = signAuthToken('user-123');
    const tampered = token.slice(0, -2) + (token.endsWith('a') ? 'b' : 'a');
    expect(() => verifyAuthToken(tampered)).toThrow();
  });

  it('throws on garbage input', () => {
    expect(() => verifyAuthToken('not-a-jwt')).toThrow();
  });
});
