import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth'
import { requireRole } from '../middleware/rbac'
import { createInvite, getInviteByToken, acceptInvite } from '../services/invite.service'
import { db } from '../db/client'

const authRouter = new Hono()

const createInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'lider', 'membro']),
})

const acceptInviteSchema = z.object({
  full_name: z.string().min(2),
  password: z.string().min(8),
})

// POST /auth/invite — admin only
authRouter.post(
  '/invite',
  authMiddleware,
  requireRole('admin'),
  zValidator('json', createInviteSchema),
  async (c) => {
    const profile = c.get('profile')
    const { email, role } = c.req.valid('json')

    const invite = await createInvite({
      church_id: profile.church_id,
      email,
      role,
      created_by: profile.id,
    })

    return c.json(invite, 201)
  }
)

// POST /auth/accept/:token — public
authRouter.post(
  '/accept/:token',
  zValidator('json', acceptInviteSchema),
  async (c) => {
    const token = c.req.param('token')
    const { full_name, password } = c.req.valid('json')

    const invite = await getInviteByToken(token)
    if (!invite) {
      return c.json({ error: 'Invalid or expired invite' }, 400)
    }

    // Create Supabase auth user
    const { data: authData, error: authError } = await db.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      return c.json({ error: 'Failed to create user' }, 500)
    }

    // Create profile
    const { error: profileError } = await db.from('profiles').insert({
      id: authData.user.id,
      church_id: invite.church_id,
      role: invite.role,
      full_name,
      status: 'ativo',
      source: 'lumina',
    })

    if (profileError) {
      await db.auth.admin.deleteUser(authData.user.id)
      return c.json({ error: 'Failed to create profile' }, 500)
    }

    try {
      await acceptInvite(token)
    } catch {
      // Non-fatal: user and profile created successfully
    }
    return c.json({ message: 'Account created successfully' }, 201)
  }
)

export { authRouter }
