export const AUTH_RULES = {
  accessTokenLifetime: '30m',
  maxFailedLogins: 5,
  lockMinutes: 15,
  minimumPasswordLength: 12,
} as const;
