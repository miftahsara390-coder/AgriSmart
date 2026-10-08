export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};
