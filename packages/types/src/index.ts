export type Role = 'admin' | 'lider' | 'membro'
export type Source = 'lumina' | 'external'
export type ChurchPlan = 'free' | 'basic' | 'pro' | 'enterprise'
export type ProfileStatus = 'ativo' | 'inativo' | 'visitante'
export type InviteStatus = 'pendente' | 'aceito' | 'expirado'
export type SlotStatus = 'pendente' | 'confirmado' | 'recusado' | 'substituido'
export type NotificationChannel = 'whatsapp' | 'email'
export type NotificationType = 'invite' | 'scale' | 'reminder' | 'custom'
export type NotificationStatus = 'sent' | 'failed' | 'delivered'

export interface Church {
  id: string
  name: string
  slug: string
  plan: ChurchPlan
  source: Source
  external_id: string | null
  synced_at: string | null
  created_at: string
}

export interface Profile {
  id: string
  church_id: string
  role: Role
  full_name: string
  phone: string | null
  avatar_url: string | null
  status: ProfileStatus
  source: Source
  external_id: string | null
  synced_at: string | null
  created_at: string
}

export interface Invite {
  id: string
  church_id: string
  email: string
  role: Role
  token: string
  status: InviteStatus
  accepted_at: string | null
  expires_at: string
  created_by: string
}

// API request/response DTOs
export interface CreateInviteRequest {
  email: string
  role: Role
}

export interface AcceptInviteRequest {
  full_name: string
  password: string
}

export interface UpdateProfileRequest {
  full_name?: string
  phone?: string
  avatar_url?: string
}

export interface AuthContext {
  profile: Profile
  church_id: string
}
