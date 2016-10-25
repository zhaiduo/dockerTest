const expect = require('chai').expect;
//Take care with arrow functions in Mocha: http://x-team.com/2016/05/setting-up-javascript-testing-tools-for-es6/

describe('Arithmetic', () => {
  it('should calculate 1 + 1 correctly', () => {
    const expectedResult = 2;

    expect(1 + 1).to.equal(expectedResult);
  });
});

describe('Arithmetic2', () => {
  it('should calculate 1 + 2 correctly', () => {
    const expectedResult = 3;

    expect(1 + 2).to.equal(expectedResult);
  });
});
