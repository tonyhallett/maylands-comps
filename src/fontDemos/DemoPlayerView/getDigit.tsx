function getDigitCount(number: number) {
  return Math.max(Math.floor(Math.log10(Math.abs(number))), 0) + 1;
}

export function getDigit(number: number, n: number, fromLeft: boolean) {
  const location = fromLeft ? getDigitCount(number) + 1 - n : n;
  return Math.floor((number / Math.pow(10, location - 1)) % 10);
}
