
export const getPuter = () => {
  if (typeof window !== "undefined" && window.puter) {
    return window.puter;
  }
  return null;
};