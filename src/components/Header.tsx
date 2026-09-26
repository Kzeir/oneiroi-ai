import React from 'react'
import {
  Menu,
  Sparkles,
  Users,
  ChevronDown,
  Cpu,
  Trash2,
  Share2,
  Check,
  Eye,
  Plus,
} from 'lucide-react'
import { Agent, AIModel } from '../types'
import { AI_MODELS } from '../data/agents'

interface HeaderProps {
  activeAgent: Agent
  collaborators: Agent[]
  selectedModel: AIModel
  onSelectModel: (model: AIModel) => void
  onOpenAgentModal: () => void
  onClearMessages: () => void
  onToggleMobileMenu: () => void
}

export const Header: React.FC<HeaderProps> = ({
  activeAgent,
  collaborators,
  selectedModel,
  onSelectModel,
  onOpenAgentModal,
  onClearMessages,
  onToggleMobileMenu,
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = React.useState(false)

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0d121f]/90 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0">
      {/* Left: Mobile Toggle & Agent Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${activeAgent.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md shadow-cyan-500/20`}
          >
            {activeAgent.name.charAt(0)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm text-white">{activeAgent.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {activeAgent.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-xs md:max-w-md">
              {activeAgent.title}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Team Collab Pills & Model Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Multi-Agent Collaborators Pill */}
        <button
          onClick={onOpenAgentModal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            collaborators.length > 0
              ? 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20'
              : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/60'
          }`}
          title="Montar Time Multi-Agente"
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            {collaborators.length > 0
              ? `Time Ativo (+${collaborators.length})`
              : 'Multi-Agente'}
          </span>
          {collaborators.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] flex items-center justify-center font-bold">
              {collaborators.length}
            </span>
          )}
        </button>

        {/* AI Model Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-200 shadow-sm transition-all"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{selectedModel.name}</span>
            <span className="sm:hidden">{selectedModel.name.split(' ')[0]}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isModelDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsModelDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 space-y-1">
                <p className="text-[10px] font-semibold text-slate-500 uppercase px-2 py-1 tracking-wider">
                  Modelos de Raciocínio & Visão
                </p>
                {AI_MODELS.map((model) => {
                  const isSelected = model.id === selectedModel.id
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelectModel(model)
                        setIsModelDropdownOpen(false)
                      }}
                      className={`w-full flex items-start justify-between p-2 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-200'
                          : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-white">{model.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{model.badge}</p>
                      </div>
                      {model.hasVision && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                          Vision
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Clear Messages Action */}
        <button
          onClick={onClearMessages}
          className="p-2 rounded-lg bg-slate-800/40 hover:bg-red-500/10 hover:text-red-400 text-slate-400 border border-transparent hover:border-red-500/30 transition-all"
          title="Limpar Conversa"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
