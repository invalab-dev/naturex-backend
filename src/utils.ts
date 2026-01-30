import { createHash } from 'crypto';

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

export type DateToISOString<T> = T extends object
  ? { [K in keyof T]-?: DateToISOString<T[K]> }
  : T extends Date
    ? string
    : T;

export function dateToISOString<T>(obj: T): DateToISOString<T> {
  if (obj === null || typeof obj !== 'object') {
    return obj as DateToISOString<T>;
  }

  if (obj instanceof Date) {
    return obj.toISOString() as DateToISOString<T>;
  }

  const result: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    Object.assign(result, { [key]: dateToISOString(obj[key]) });
  }

  return result as DateToISOString<T>;
}

export function hashTokenToHex(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
