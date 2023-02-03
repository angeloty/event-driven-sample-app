export const itemMatch = <E, C>(expected: E, compare: C) => {
  return !Object.keys(compare).some(
    (k) =>
      ["string", "number", "boolean"].some((t) => typeof compare[k] === t) &&
      expected[k] !== compare[k]
  );
};