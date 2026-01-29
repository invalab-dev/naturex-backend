export type UndefinedToNull<T> = T extends object
  ? { [K in keyof T]-?: UndefinedToNull<T[K]> }
  : T extends undefined
    ? null
    : T;

export function undefinedToNull<T>(obj: T): UndefinedToNull<T> {
  if (obj === null || typeof obj !== 'object') {
    return (obj === undefined ? null : obj) as UndefinedToNull<T>;
  }

  const result: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    Object.assign(result, { [key]: undefinedToNull(obj[key]) });
  }

  return result as UndefinedToNull<T>;
}
