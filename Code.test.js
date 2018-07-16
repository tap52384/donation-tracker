const code = require('.Code');

test('verifies empty string is empty', () => {
    expect(isNullOrEmpty('')).toBe(true);
});
