
// https://stackoverflow.com/a/44622300/233884
export type GenerateRandomIdOptions = { length: number, prefix: string };
export const generateRandomId = ({ length = 12, prefix = '' }: Partial<GenerateRandomIdOptions> = {}): string => {
  return prefix + Array.from(Array(length), () => Math.floor(Math.random() * 36).toString(36)).join('');
};
