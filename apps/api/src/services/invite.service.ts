import { randomUUID } from 'crypto'
import { db } from '../db/client'
import type { Role, Invite } from '@lumina/types'

interface CreateInviteParams {
  church_id: string
  email: string
  role: Role
  created_by: string
}

export async function createInvite(params: CreateInviteParams): Promise<Invite> {
  const token = randomUUID()
  const expires_at = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

  const { data, error } = await db
    .from('invites')
    .insert({ ...params, token, expires_at })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Invite
}

export async function getInviteByToken(token: string): Promise<Invite | null> {
  const { data, error } = await db
    .from('invites')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !data) return null

  const invite = data as Invite
  const isExpired = new Date(invite.expires_at) < new Date()
  const isAccepted = invite.accepted_at !== null

  if (isExpired || isAccepted) return null
  return invite
}

export async function acceptInvite(token: string): Promise<void> {
  const { error } = await db
    .from('invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('token', token)

  if (error) throw new Error(error.message)
}
