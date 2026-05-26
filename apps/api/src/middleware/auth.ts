import type { Context, Next } from 'hono'
import { jwtVerify, createRemoteJWKSet } from 'jose'
import { db } from '../db/client'
import type { Profile } from '@lumina/types'

declare module 'hono' {
  interface ContextVariableMap {
    profile: Profile
  }
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null

function getJwks() {
  if (!jwks) {
    const SUPABASE_URL = process.env.SUPABASE_URL!
    jwks = createRemoteJWKSet(
      new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
    )
  }
  return jwks
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)

  let userId: string
  try {
    const { payload } = await jwtVerify(token, getJwks())
    userId = payload.sub as string
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }

  const { data: profile, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return c.json({ error: 'Profile not found' }, 401)
  }

  c.set('profile', profile as Profile)
  await next()
}
