import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn(() => 'mock-jwks'),
  jwtVerify: vi.fn(),
}))

vi.mock('../../db/client', () => ({
  db: {
    from: vi.fn(),
  },
}))

import { jwtVerify } from 'jose'
import { db } from '../../db/client'
import { authMiddleware } from '../../middleware/auth'

describe('authMiddleware', () => {
  let app: Hono

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.SUPABASE_URL = 'https://test.supabase.co'
    app = new Hono()
    app.use('*', authMiddleware)
    app.get('/test', (c) => c.json(c.get('profile')))
  })

  it('returns 401 when no Authorization header', async () => {
    const res = await app.request('/test')
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 401 when Authorization header has wrong format', async () => {
    const res = await app.request('/test', {
      headers: { Authorization: 'Basic some-token' },
    })
    expect(res.status).toBe(401)
  })

  it('returns 401 when JWT verification fails', async () => {
    vi.mocked(jwtVerify).mockRejectedValueOnce(new Error('Invalid JWT'))
    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer bad-token' },
    })
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Invalid token')
  })

  it('returns 401 when profile not found in DB', async () => {
    vi.mocked(jwtVerify).mockResolvedValueOnce({
      payload: { sub: 'user-123' },
    } as any)

    vi.mocked(db.from).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
        })),
      })),
    } as any)

    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Profile not found')
  })

  it('injects profile into context and calls next when valid', async () => {
    const mockProfile = {
      id: 'user-123',
      church_id: 'church-1',
      role: 'admin',
      full_name: 'Test User',
    }

    vi.mocked(jwtVerify).mockResolvedValueOnce({
      payload: { sub: 'user-123' },
    } as any)

    vi.mocked(db.from).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockProfile, error: null })),
        })),
      })),
    } as any)

    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe('user-123')
    expect(body.church_id).toBe('church-1')
  })
})
