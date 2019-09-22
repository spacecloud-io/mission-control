import { sortRulesByPrefix } from './utils';

describe('sortRulesByPrefix method', () => {
  it('sort rules by prefix', () => {
    const rules = [
      { prefix: "/abc" },
      { prefix: "/{xyz}" },
      { prefix: "/abc/xyz" },
      { prefix: "/abc/{xyz}/hello" }
    ]
  
    const expectedRules = [
      { prefix: "/abc/xyz" },
      { prefix: "/abc/{xyz}/hello" },
      { prefix: "/abc" },
      { prefix: "/{xyz}" }
    ]
    expect(sortRulesByPrefix(rules)).toEqual(expectedRules);
  });
});