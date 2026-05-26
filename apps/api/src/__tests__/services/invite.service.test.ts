import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../db/client', () => ({
  db: {
    from: vi.fn(),
  },
}))

import { createInvite, acceptInvite, getInviteByToken } from '../../services/invite.service'
import { db } from '../../db/client'

describe('invite.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('createInvite', () => {
    it('inserts invite and returns it', async () => {
      const mockInvite = {
        id: 'inv-1',
        church_id: 'church-1',
        email: 'test@test.com',
        role: 'membro',
        token: 'some-uuid',
        expires_at: expect.any(String),
        created_by: 'user-1',
      }

      vi.mocked(db.from).mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockInvite, error: null })),
          })),
        })),
      } as any)

      const result = await createInvite({
        church_id: 'church-1',
        email: 'test@test.com',
        role: 'membro',
        created_by: 'user-1',
      })

      expect(result).toMatchObject({
        email: 'test@test.com',
        role: 'membro',
      })
    })

    it('throws when db returns error', async () => {
      vi.mocked(db.from).mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'DB error' } })),
          })),
        })),
      } as any)

      await expect(createInvite({
        church_id: 'church-1',
        email: 'fail@test.com',
        role: 'membro',
        created_by: 'user-1',
      })).rejects.toThrow('DB error')
    })
  })

  describe('getInviteByToken', () => {
    it('returns null when invite not found', async () => {
      vi.mocked(db.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
          })),
        })),
      } as any)

      const result = await getInviteByToken('bad-token')
      expect(result).toBeNull()
    })

    it('returns null when invite is expired', async () => {
      const expiredInvite = {
        id: 'inv-1',
        token: 'token-1',
        expires_at: new Date(Date.now() - 1000).toISOString(),
        accepted_at: null,
      }

      vi.mocked(db.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: expiredInvite, error: null })),
          })),
        })),
      } as any)

      const result = await getInviteByToken('token-1')
      expect(result).toBeNull()
    })

    it('returns null when invite already accepted', async () => {
      const acceptedInvite = {
        id: 'inv-1',
        token: 'token-1',
        expires_at: new Date(Date.now() + 100000).toISOString(),
        accepted_at: new Date().toISOString(),
      }

      vi.mocked(db.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: acceptedInvite, error: null })),
          })),
        })),
      } as any)

      const result = await getInviteByToken('token-1')
      expect(result).toBeNull()
    })

    it('returns invite when valid and not expired', async () => {
      const validInvite = {
        id: 'inv-1',
        token: 'token-1',
        expires_at: new Date(Date.now() + 100000).toISOString(),
        accepted_at: null,
      }

      vi.mocked(db.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: validInvite, error: null })),
          })),
        })),
      } as any)

      const result = await getInviteByToken('token-1')
      expect(result).toEqual(validInvite)
    })
  })

  describe('acceptInvite', () => {
    it('updates invite accepted_at', async () => {
      const updateMock = vi.fn(() => Promise.resolve({ error: null }))
      vi.mocked(db.from).mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: updateMock,
        })),
      } as any)

      await expect(acceptInvite('token-1')).resolves.toBeUndefined()
    })

    it('throws when db returns error', async () => {
      vi.mocked(db.from).mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: { message: 'Update failed' } })),
        })),
      } as any)

      await expect(acceptInvite('token-1')).rejects.toThrow('Update failed')
    })
  })
})
