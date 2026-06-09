import { hashPassword, verifyPassword } from './passwords';

describe('passwords', () => {
  it('hashes a password to a bcrypt string', async () => {
    const hash = await hashPassword('supersecret123');
    expect(hash).toMatch(/^\$2[aby]\$/);
    expect(hash).not.toContain('supersecret123');
  });

  it('verifies a correct password', async () => {
    const hash = await hashPassword('supersecret123');
    await expect(verifyPassword('supersecret123', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('supersecret123');
    await expect(verifyPassword('wrong', hash)).resolves.toBe(false);
  });

  it('produces different hashes for the same password (salted)', async () => {
    const a = await hashPassword('supersecret123');
    const b = await hashPassword('supersecret123');
    expect(a).not.toBe(b);
  });
});
