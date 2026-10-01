// Unit tests for auth controller logic (no DB)
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Minimal environment setup
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

describe('Auth — password hashing', () => {
  test('bcrypt hashes and verifies password correctly', async () => {
    const plain = 'MyPassword123';
    const hash = await bcrypt.hash(plain, 10);
    expect(hash).not.toBe(plain);
    const valid = await bcrypt.compare(plain, hash);
    expect(valid).toBe(true);
  });

  test('bcrypt rejects wrong password', async () => {
    const hash = await bcrypt.hash('correct', 10);
    const valid = await bcrypt.compare('wrong', hash);
    expect(valid).toBe(false);
  });
});

describe('Auth — JWT token generation', () => {
  test('generates a verifiable JWT', () => {
    const userId = 'some-uuid-123';
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe(userId);
  });

  test('rejects a tampered JWT', () => {
    const token = jwt.sign({ userId: 'abc' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    expect(() => {
      jwt.verify(token + 'tampered', process.env.JWT_SECRET);
    }).toThrow();
  });
});
