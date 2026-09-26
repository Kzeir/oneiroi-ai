import React from 'react'
import {
  MessageSquare,
  Plus,
  Sparkles,
  Bot,
  Layers,
  Image as ImageIcon,
  Settings,
  Trash2,
  Pin,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react'
import { ChatSession, Agent, Sector } from '../types'
import { SECTORS } from '../data/agents'

interface SidebarProps {
  sessions: ChatSession[]
  activeSessionId: string
  activeSector: string | null
  activeAgent: Agent
  collaborators: Agent[]
  onSelectSession: (id: string) => void
  onNewChat: () => void
  onDeleteSession: (id: string, e: React.MouseEvent) => void
  onTogglePinSession: (id: string, e: React.MouseEvent) => void
  onOpenAgentModal: () => void
  onOpenImageStudio: () => void
  onOpenSettings: () => void
  onSelectSector: (sectorId: string | null) => void
  isOpenMobile: boolean
  onCloseMobile: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  activeSector,
  activeAgent,
  collaborators,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onTogglePinSession,
  onOpenAgentModal,
  onOpenImageStudio,
  onOpenSettings,
  onSelectSector,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 w-72 bg-[#0d121f] border-r border-slate-800/80 flex flex-col z-50 transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / Brand */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                ONEIROI <span className="text-cyan-400">AI</span>
              </span>
              <p className="text-[10px] text-slate-400">Multi-Agent Intelligence</p>
            </div>
          </div>

          <button
            onClick={onNewChat}
            className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all hover:scale-105"
            title="Nova Conversa"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Tools Navigation */}
        <div className="p-3 border-b border-slate-800/60 space-y-1.5">
          <button
            onClick={onOpenAgentModal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 text-xs font-medium text-slate-200 border border-slate-700/50 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>Explorar Agentes</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onOpenImageStudio}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-xs font-medium text-purple-300 border border-purple-500/30 transition-all group"
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Estúdio de Imagens</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </div>

        {/* Sectors Filter Pills */}
        <div className="px-3 pt-3 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2 px-1">
            Setores Especializados
          </p>
          <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-none">
            <button
              onClick={() => onSelectSector(null)}
              className={`px-2 py-1 rounded-md text-[11px] whitespace-nowrap transition-all ${
                activeSector === null
                  ? 'bg-cyan-500 text-white font-medium shadow-sm shadow-cyan-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            {SECTORS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => onSelectSector(sec.id)}
                className={`px-2 py-1 rounded-md text-[11px] whitespace-nowrap transition-all ${
                  activeSector === sec.id
                    ? 'bg-cyan-500 text-white font-medium shadow-sm shadow-cyan-500/30'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sec.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1 px-1">
            Histórico de Chats
          </p>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p>Nenhuma conversa recente</p>
            </div>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.id === activeSessionId
              return (
                <div
                  key={sess.id}
                  onClick={() => onSelectSession(sess.id)}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-all ${
                    isActive
                      ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-500/30 shadow-sm'
                      : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden pr-6">
                    {sess.isPinned ? (
                      <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    <span className="truncate">{sess.title}</span>
                  </div>

                  <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-[#0d121f]/90 px-1 py-0.5 rounded transition-opacity">
                    <button
                      onClick={(e) => onTogglePinSession(sess.id, e)}
                      className="p-1 hover:text-amber-400 text-slate-400"
                      title={sess.isPinned ? 'Desafixar' : 'Fixar'}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => onDeleteSession(sess.id, e)}
                      className="p-1 hover:text-red-400 text-slate-400"
                      title="Excluir"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer / Active Agent Status & Settings */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
          <div
            onClick={onOpenAgentModal}
            className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all"
          >
            <div
              className={`w-7 h-7 rounded-full bg-gradient-to-tr ${activeAgent.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}
            >
              {activeAgent.name.charAt(0)}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-medium text-white truncate">{activeAgent.name}</p>
              <p className="text-[10px] text-cyan-400 truncate">{activeAgent.badge}</p>
            </div>
            <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          </div>

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-700/60"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configurações & Chaves</span>
          </button>
        </div>
      </aside>
    </>
  )
}
