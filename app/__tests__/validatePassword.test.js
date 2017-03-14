const validatePassword = require('../validatePassword');

describe(`validatePassword`, () => {
  test(`Returns false for passwords shorter or equal to 8 characters`, () => {
    expect(validatePassword('abcd1234')).toBe(false);
    expect(validatePassword('abcd12345')).toBe(true);
  });

  test(`Returns false for passwords that only contain alphabetical characters`, () => {
    expect(validatePassword('abcdefghijklmno')).toBe(false);
    expect(validatePassword('abcdefghijklmn1')).toBe(true);
  });
});
