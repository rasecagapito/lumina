import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { requireRole } from '../../middleware/rbac'
import type { Profile } from '@lumina/types'

function makeApp(role: string) {
  const app = new Hono()
  app.use('*', async (c, next) => {
    c.set('profile', { role } as Profile)
    await next()
  })
  app.get('/test', requireRole('admin'), (c) => c.json({ ok: true }))
  return app
}

describe('requireRole', () => {
  it('allows request when role matches', async () => {
    const res = await makeApp('admin').request('/test')
    expect(res.status).toBe(200)
  })

  it('returns 403 when role does not match', async () => {
    const res = await makeApp('membro').request('/test')
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('Forbidden')
  })

  it('allows multiple roles — lider passes admin|lider check', async () => {
    const app = new Hono()
    app.use('*', async (c, next) => {
      c.set('profile', { role: 'lider' } as Profile)
      await next()
    })
    app.get('/test', requireRole('admin', 'lider'), (c) => c.json({ ok: true }))
    const res = await app.request('/test')
    expect(res.status).toBe(200)
  })

  it('returns 403 when membro tries admin|lider route', async () => {
    const app = new Hono()
    app.use('*', async (c, next) => {
      c.set('profile', { role: 'membro' } as Profile)
      await next()
    })
    app.get('/test', requireRole('admin', 'lider'), (c) => c.json({ ok: true }))
    const res = await app.request('/test')
    expect(res.status).toBe(403)
  })
})
