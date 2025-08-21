export const date = (str?: string) => {
  try {
    if (str) return new Date(str);
  } catch {
    return;
  }
};
