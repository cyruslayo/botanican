const MONEY_SCALE = 100;

export function toMinorUnits(value: number | string): number {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * MONEY_SCALE);
}

export function fromMinorUnits(value: number): number {
  return value / MONEY_SCALE;
}

export function multiplyMoney(
  value: number | string,
  quantity: number,
): number {
  return fromMinorUnits(toMinorUnits(value) * quantity);
}

export function sumMoney(...values: Array<number | string>): number {
  return fromMinorUnits(
    values.reduce<number>((total, value) => total + toMinorUnits(value), 0),
  );
}
