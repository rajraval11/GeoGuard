import type { AuthUser } from '../types/index.js';

export function getTenantFilter(user: AuthUser) {
  // ADMIN has system-wide access across all organizations
  if (user.role === 'ADMIN') {
    return {};
  }
  // Normal users are strictly isolated to their own organization
  return {
    organizationId: user.organizationId
  };
}
