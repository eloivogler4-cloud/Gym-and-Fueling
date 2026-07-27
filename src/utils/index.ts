// Small utilities used by multiple modules
export function ensure<T>(v: T | null | undefined, message = 'Value not found'): T {
  if (v == null) throw new Error(message);
  return v;
}
