export const weatherKeys = {
  all: ['weather'] as const,
  current: (city?: string) => [...weatherKeys.all, 'current', city || 'default'] as const,
};
