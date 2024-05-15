export const toSnakeCase = (key: string): string => key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
