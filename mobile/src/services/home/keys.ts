export const homeKeys = {
  all: ['home'] as const,
  dashboard: () => [...homeKeys.all, 'dashboard'] as const,
};
