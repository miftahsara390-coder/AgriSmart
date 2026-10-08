export const cropKeys = {
  all: ['crops'] as const,
  lists: () => [...cropKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...cropKeys.lists(), filters || {}] as const,
  details: () => [...cropKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...cropKeys.details(), String(id)] as const,
  telemetry: () => [...cropKeys.all, 'telemetry'] as const,
  observations: (id: string | number) => [...cropKeys.detail(id), 'observations'] as const,
  sensors: (id: string | number) => [...cropKeys.detail(id), 'sensors'] as const,
  intelligence: (id: string | number) => [...cropKeys.detail(id), 'intelligence'] as const,
};
