export const agentKeys = {
  all: ['agent'] as const,
  history: () => [...agentKeys.all, 'history'] as const,
};
