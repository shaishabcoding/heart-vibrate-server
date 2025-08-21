export const json = <T>(data?: any): T | undefined => {
  try {
    if (data) {
      if (typeof data === 'object' || Array.isArray(data)) return data as T;
      if (typeof data === 'string') return JSON.parse(data);
      else return;
    }
  } catch (error) {
    return;
  }
};
