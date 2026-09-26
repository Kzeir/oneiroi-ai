import React, { useState } from 'react'
import {
  X,
  Bot,
  Users,
  Check,
  Zap,
  Eye,
  Image as ImageIcon,
  Code,
  Brain,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { Agent, SectorType } from '../types'
import { AGENTS, SECTORS } from '../data/agents'

interface AgentSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  activeAgent: Agent
  collaborators: Agent[]
  onSelectPrimaryAgent: (agent: Agent) => void
  onToggleCollaborator: (agent: Agent) => void
  onClearCollaborators: () => void
}

export const AgentSelectorModal: React.FC<AgentSelectorModalProps> = ({
  isOpen,
  onClose,
  activeAgent,
  collaborators,
  onSelectPrimaryAgent,
  onToggleCollaborator,
  onClearCollaborators,
}) => {
  const [selectedSector, setSelectedSector] = useState<SectorType | 'all'>('all')

  if (!isOpen) return null

  const filteredAgents =
    selectedSector === 'all'
      ? AGENTS
      : AGENTS.filter((a) => a.sector === selectedSector)

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0d121f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Central de Agentes Especializados
              </h2>
              <p className="text-xs text-slate-400">
                Escolha o agente principal ou monte um time para debate multi-agente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sectors Filter Pills */}
        <div className="p-3 sm:px-6 border-b border-slate-800/60 bg-[#0d121f] flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setSelectedSector('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedSector === 'all'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Todos os Setores ({AGENTS.length})
          </button>
          {SECTORS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSector(sec.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedSector === sec.id
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {sec.name}
            </button>
          ))}
        </div>

        {/* Active Team Summary Bar */}
        {collaborators.length > 0 && (
          <div className="px-4 sm:px-6 py-2 bg-purple-950/30 border-b border-purple-500/20 flex items-center justify-between text-xs text-purple-300 shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <Users className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="font-semibold">Time Multi-Agente:</span>
              <span className="truncate">
                {activeAgent.name} (Principal) + {collaborators.map((c) => c.name).join(', ')}
              </span>
            </div>
            <button
              onClick={onClearCollaborators}
              className="text-[11px] underline hover:text-white shrink-0 ml-2"
            >
              Limpar Time
            </button>
          </div>
        )}

        {/* Agents Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredAgents.map((agent) => {
            const isPrimary = agent.id === activeAgent.id
            const isCollab = collaborators.some((c) => c.id === agent.id)

            return (
              <div
                key={agent.id}
                className={`group relative p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isPrimary
                    ? 'bg-cyan-950/30 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                    : isCollab
                    ? 'bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Agent Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${agent.avatarColor} flex items-center justify-center text-white text-base font-bold shadow-md`}
                      >
                        {agent.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          {agent.name}
                          {isPrimary && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-cyan-500 text-white">
                              Principal
                            </span>
                          )}
                          {isCollab && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-500 text-white">
                              Colaborador
                            </span>
                          )}
                        </h3>
                        <p className="text-[11px] text-cyan-400 font-medium">{agent.badge}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {agent.description}
                  </p>

                  {/* Capabilities Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {agent.capabilities.vision && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        <Eye className="w-3 h-3 text-cyan-400" />
                        <span>Visão</span>
                      </span>
                    )}
                    {agent.capabilities.imageGen && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        <ImageIcon className="w-3 h-3 text-purple-400" />
                        <span>Gerador Imagens</span>
                      </span>
                    )}
                    {agent.capabilities.codeExecution && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        <Code className="w-3 h-3 text-emerald-400" />
                        <span>Código</span>
                      </span>
                    )}
                    {agent.capabilities.deepReasoning && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        <Brain className="w-3 h-3 text-amber-400" />
                        <span>Raciocínio</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80 mt-3">
                  <button
                    onClick={() => {
                      onSelectPrimaryAgent(agent)
                      onClose()
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      isPrimary
                        ? 'bg-cyan-500 text-white cursor-default'
                        : 'bg-slate-800 hover:bg-cyan-500 text-slate-200 hover:text-white'
                    }`}
                  >
                    {isPrimary ? 'Agente Ativo' : 'Definir Principal'}
                  </button>

                  {!isPrimary && (
                    <button
                      onClick={() => onToggleCollaborator(agent)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        isCollab
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500'
                          : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-purple-300 border-slate-700'
                      }`}
                      title={isCollab ? 'Remover do Time' : 'Adicionar ao Time Multi-Agente'}
                    >
                      {isCollab ? 'No Time' : '+ Time'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
