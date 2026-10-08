export const scanKeys = {
  all: ['scans'] as const,
  history: () => [...scanKeys.all, 'history'] as const,
};
