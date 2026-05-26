import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('db client', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({ from: vi.fn() })),
    }))
    process.env.SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
  })

  it('exports a supabase client', async () => {
    const { db } = await import('../../db/client')
    expect(db).toBeDefined()
    expect(typeof db.from).toBe('function')
  })

  it('throws when SUPABASE_URL is missing', async () => {
    delete process.env.SUPABASE_URL
    await expect(import('../../db/client')).rejects.toThrow(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    )
  })

  it('throws when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    await expect(import('../../db/client')).rejects.toThrow(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    )
  })
})
