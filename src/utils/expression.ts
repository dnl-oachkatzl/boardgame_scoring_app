const ALLOWED = /^[\d\s+\-*/.]+$/;

export function evaluateExpression(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (!ALLOWED.test(trimmed)) return null;
  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${trimmed})`)();
    if (typeof result !== 'number' || !isFinite(result)) return null;
    return Math.round(result * 100) / 100;
  } catch {
    return null;
  }
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
