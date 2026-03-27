export class UppercaseValueConverter {
  toView(value: unknown): unknown {
    if (typeof value === 'string') {
      return value.toUpperCase();
    }

    if (Array.isArray(value)) {
      return value.map((item) => (typeof item === 'string' ? item.toUpperCase() : item));
    }

    return value;
  }
}
