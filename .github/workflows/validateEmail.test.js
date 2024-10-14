global.$ = require('jquery');
test('validates email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('another@test.co')).toBe(true);
});
