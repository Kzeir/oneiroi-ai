import React, { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { ChatArea } from './components/ChatArea'
import { InputBox } from './components/InputBox'
import { AgentSelectorModal } from './components/AgentSelectorModal'
import { ImageStudioModal } from './components/ImageStudioModal'
import { SettingsModal } from './components/SettingsModal'
import { Agent, AIModel, ChatSession, GeneratedImage, ImageAttachment, Message } from './types'
import { AGENTS, AI_MODELS } from './data/agents'
import { processAgentResponse, generateAIImage } from './services/aiService'

export function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('oneiroi_ai_sessions')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse sessions:', e)
      }
    }
    return []
  })

  const [activeSessionId, setActiveSessionId] = useState<string>('')
  const [activeSector, setActiveSector] = useState<string | null>(null)
  const [activeAgent, setActiveAgent] = useState<Agent>(AGENTS[0])
  const [collaborators, setCollaborators] = useState<Agent[]>([])
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0])

  // Modals state
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false)
  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isThinking, setIsThinking] = useState(false)

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('oneiroi_ai_sessions', JSON.stringify(sessions))
  }, [sessions])

  // Initialize or get current session
  const currentSession = sessions.find((s) => s.id === activeSessionId)
  const messages = currentSession ? currentSession.messages : []

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `sess_${Date.now()}`,
      title: `Nova Conversa com ${activeAgent.name}`,
      primaryAgentId: activeAgent.id,
      collaboratorAgentIds: collaborators.map((c) => c.id),
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      mode: collaborators.length > 0 ? 'team_collab' : 'single',
    }
    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    setIsMobileMenuOpen(false)
  }

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (activeSessionId === id) {
      setActiveSessionId('')
    }
  }

  const handleTogglePinSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    )
  }

  const handleSendMessage = async (
    text: string,
    attachments: ImageAttachment[],
    isImageGenMode: boolean
  ) => {
    let currentId = activeSessionId
    let session = sessions.find((s) => s.id === currentId)

    if (!session) {
      const newSession: ChatSession = {
        id: `sess_${Date.now()}`,
        title: text ? text.slice(0, 32) + (text.length > 32 ? '...' : '') : 'Análise Visual',
        primaryAgentId: activeAgent.id,
        collaboratorAgentIds: collaborators.map((c) => c.id),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        mode: isImageGenMode ? 'image_studio' : collaborators.length > 0 ? 'team_collab' : 'single',
      }
      setSessions((prev) => [newSession, ...prev])
      setActiveSessionId(newSession.id)
      currentId = newSession.id
    }

    const userMessage: Message = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined,
    }

    // Append user message immediately
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentId) {
          return {
            ...s,
            title: s.messages.length === 0 && text ? text.slice(0, 32) : s.title,
            messages: [...s.messages, userMessage],
            updatedAt: Date.now(),
          }
        }
        return s
      })
    )

    setIsThinking(true)

    try {
      if (isImageGenMode) {
        // Image generation mode directly in chat
        const generatedImg = await generateAIImage({
          prompt: text,
          style: 'Cyberpunk Neon',
          aspectRatio: '16:9',
        })

        const botMessage: Message = {
          id: `msg_gen_${Date.now()}`,
          role: 'assistant',
          agentId: 'prompt-artist',
          agentName: 'Luminary Artist',
          content: `Aqui está a renderização visual gerada para o seu prompt: **"${text}"**`,
          timestamp: Date.now(),
          generatedImage: generatedImg,
        }

        setSessions((prev) =>
          prev.map((s) => (s.id === currentId ? { ...s, messages: [...s.messages, botMessage] } : s))
        )
      } else {
        // Standard or multi-agent response
        const responses = await processAgentResponse(
          text,
          activeAgent,
          collaborators,
          attachments,
          selectedModel.id
        )

        setSessions((prev) =>
          prev.map((s) => (s.id === currentId ? { ...s, messages: [...s.messages, ...responses] } : s))
        )
      }
    } catch (err) {
      console.error('Agent generation error:', err)
    } finally {
      setIsThinking(false)
    }
  }

  const handleSendImageToChat = (image: GeneratedImage) => {
    let currentId = activeSessionId
    if (!currentId) {
      const newSession: ChatSession = {
        id: `sess_${Date.now()}`,
        title: `Estúdio: ${image.style}`,
        primaryAgentId: activeAgent.id,
        collaboratorAgentIds: [],
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        mode: 'image_studio',
      }
      setSessions((prev) => [newSession, ...prev])
      setActiveSessionId(newSession.id)
      currentId = newSession.id
    }

    const imgMessage: Message = {
      id: `msg_gen_${Date.now()}`,
      role: 'assistant',
      agentId: 'prompt-artist',
      agentName: 'Luminary Artist',
      content: `Imagem do Estúdio Visual importada com sucesso: **"${image.prompt}"**`,
      timestamp: Date.now(),
      generatedImage: image,
    }

    setSessions((prev) =>
      prev.map((s) => (s.id === currentId ? { ...s, messages: [...s.messages, imgMessage] } : s))
    )
  }

  const handleClearMessages = () => {
    if (!activeSessionId) return
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [] } : s))
    )
  }

  const handleToggleCollaborator = (agent: Agent) => {
    setCollaborators((prev) => {
      const exists = prev.some((c) => c.id === agent.id)
      if (exists) {
        return prev.filter((c) => c.id !== agent.id)
      }
      return [...prev, agent]
    })
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f17] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Left Navigation Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        activeSector={activeSector}
        activeAgent={activeAgent}
        collaborators={collaborators}
        onSelectSession={(id) => {
          setActiveSessionId(id)
          setIsMobileMenuOpen(false)
        }}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onTogglePinSession={handleTogglePinSession}
        onOpenAgentModal={() => setIsAgentModalOpen(true)}
        onOpenImageStudio={() => setIsImageStudioOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSelectSector={setActiveSector}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <Header
          activeAgent={activeAgent}
          collaborators={collaborators}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          onOpenAgentModal={() => setIsAgentModalOpen(true)}
          onClearMessages={handleClearMessages}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Central Chat Feed */}
        <ChatArea
          messages={messages}
          activeAgent={activeAgent}
          collaborators={collaborators}
          isThinking={isThinking}
          onSelectPrompt={(prompt) => handleSendMessage(prompt, [], false)}
          onOpenImageStudio={() => setIsImageStudioOpen(true)}
        />

        {/* Bottom Input Toolbar */}
        <InputBox
          onSendMessage={handleSendMessage}
          activeAgent={activeAgent}
          collaborators={collaborators}
          isThinking={isThinking}
          onOpenAgentModal={() => setIsAgentModalOpen(true)}
          onOpenImageStudio={() => setIsImageStudioOpen(true)}
        />
      </main>

      {/* Modals */}
      <AgentSelectorModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        activeAgent={activeAgent}
        collaborators={collaborators}
        onSelectPrimaryAgent={setActiveAgent}
        onToggleCollaborator={handleToggleCollaborator}
        onClearCollaborators={() => setCollaborators([])}
      />

      <ImageStudioModal
        isOpen={isImageStudioOpen}
        onClose={() => setIsImageStudioOpen(false)}
        onSendImageToChat={handleSendImageToChat}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}

export default App
