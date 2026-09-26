export type SectorType = 
  | 'engineering' 
  | 'marketing' 
  | 'business' 
  | 'creative' 
  | 'data' 
  | 'legal'

export interface Sector {
  id: SectorType
  name: string
  description: string
  color: string
}

export interface Agent {
  id: string
  name: string
  title: string
  sector: SectorType
  avatarColor: string
  badge: string
  description: string
  systemPrompt: string
  suggestedPrompts: string[]
  capabilities: {
    vision: boolean
    imageGen: boolean
    codeExecution: boolean
    deepReasoning: boolean
  }
}

export interface ImageAttachment {
  id: string
  url: string
  name: string
  size: string
  type: string
}

export interface GeneratedImage {
  id: string
  url: string
  prompt: string
  style: string
  aspectRatio: string
  timestamp: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  agentId?: string
  agentName?: string
  attachments?: ImageAttachment[]
  generatedImage?: GeneratedImage
  isThinking?: boolean
}

export interface ChatSession {
  id: string
  title: string
  primaryAgentId: string
  collaboratorAgentIds: string[]
  messages: Message[]
  createdAt: number
  updatedAt: number
  isPinned?: boolean
  mode: 'single' | 'team_collab' | 'image_studio'
}

export interface AIModel {
  id: string
  name: string
  provider: 'Google' | 'Anthropic' | 'OpenAI' | 'Meta'
  badge: string
  description: string
  contextWindow: string
  hasVision: boolean
}
