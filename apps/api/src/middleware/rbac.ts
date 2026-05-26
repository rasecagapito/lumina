import type { Context, Next } from 'hono'
import type { Role } from '@lumina/types'

export function requireRole(...roles: Role[]) {
  return async (c: Context, next: Next) => {
    const profile = c.get('profile')
    if (!roles.includes(profile.role as Role)) {
      return c.json({ error: 'Forbidden' }, 403)
    }
    await next()
  }
}
