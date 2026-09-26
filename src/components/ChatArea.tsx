import React, { useRef, useEffect } from 'react'
import {
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  Download,
  Maximize2,
  Image as ImageIcon,
  Zap,
  ArrowRight,
  Eye,
  FileCode,
} from 'lucide-react'
import { Message, Agent, GeneratedImage } from '../types'

interface ChatAreaProps {
  messages: Message[]
  activeAgent: Agent
  collaborators: Agent[]
  isThinking: boolean
  onSelectPrompt: (prompt: string) => void
  onOpenImageStudio: () => void
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  activeAgent,
  collaborators,
  isThinking,
  onSelectPrompt,
  onOpenImageStudio,
}) => {
  const scrollEndRef = useRef<HTMLDivElement>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [previewImage, setPreviewImage] = React.useState<string | null>(null)

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Empty State / Welcome Screen */}
      {messages.length === 0 && (
        <div className="max-w-3xl mx-auto py-8 sm:py-12 space-y-8 animate-fadeIn">
          {/* Hero Agent Showcase */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${activeAgent.avatarColor} mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-cyan-500/30 ring-4 ring-slate-800/80`}
              >
                {activeAgent.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#0b0f17] border border-cyan-500/40">
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {activeAgent.name}
              </h2>
              <p className="text-sm font-medium text-cyan-400">{activeAgent.title}</p>
              <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed pt-1">
                {activeAgent.description}
              </p>
            </div>

            {collaborators.length > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs">
                <span className="font-semibold">Modo Time Multi-Agente:</span>
                <span>{collaborators.map((c) => c.name).join(', ')}</span>
              </div>
            )}
          </div>

          {/* Suggested Prompts Cards */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
              Sugestões Rápidas para Iniciar
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {activeAgent.suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(prompt)}
                  className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-left text-xs text-slate-300 hover:text-white transition-all group relative overflow-hidden shadow-sm"
                >
                  <p className="pr-4 leading-relaxed line-clamp-3">{prompt}</p>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages Feed */}
      {messages.map((msg) => {
        const isUser = msg.role === 'user'

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-3xl mx-auto ${
              isUser ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-md ${
                isUser
                  ? 'bg-gradient-to-tr from-cyan-600 to-blue-600'
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-600'
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : msg.agentName?.charAt(0) || <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble Content */}
            <div
              className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-lg ${
                isUser
                  ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-tr-sm'
                  : 'bg-[#141b2d] border border-slate-800/90 text-slate-200 rounded-tl-sm'
              }`}
            >
              {/* Agent Tag if Assistant */}
              {!isUser && msg.agentName && (
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[11px] font-semibold text-cyan-400">
                  <span>{msg.agentName}</span>
                  <button
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className="p-1 hover:text-white text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copiar Resposta"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}

              {/* Vision Image Attachment Preview */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mb-2.5 flex flex-wrap gap-2">
                  {msg.attachments.map((att) => (
                    <div
                      key={att.id}
                      onClick={() => setPreviewImage(att.url)}
                      className="relative group/att rounded-lg overflow-hidden border border-white/20 cursor-pointer max-w-[200px]"
                    >
                      <img
                        src={att.url}
                        alt={att.name}
                        className="w-full h-28 object-cover group-hover/att:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/att:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Generated Image Result Card */}
              {msg.generatedImage && (
                <div className="mt-2 mb-2 rounded-xl overflow-hidden border border-purple-500/30 bg-slate-950/60 p-2 space-y-2">
                  <div className="relative group/gen rounded-lg overflow-hidden">
                    <img
                      src={msg.generatedImage.url}
                      alt={msg.generatedImage.prompt}
                      className="w-full max-h-80 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg">
                      <span className="text-[10px] text-purple-300 font-medium">
                        {msg.generatedImage.aspectRatio}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-semibold text-white truncate">
                        {msg.generatedImage.style}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {msg.generatedImage.prompt}
                      </p>
                    </div>

                    <a
                      href={msg.generatedImage.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/30 transition-all shrink-0 ml-2"
                      title="Download em Alta Resolução"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Message Markdown-style Body */}
              <div className="space-y-2 whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>

              {/* Timestamp */}
              <div
                className={`text-[9px] pt-1 text-right ${
                  isUser ? 'text-cyan-200/70' : 'text-slate-500'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        )
      })}

      {/* Thinking Indicator */}
      {isThinking && (
        <div className="flex items-start gap-3 max-w-3xl mx-auto">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md animate-pulse">
            <Bot className="w-4 h-4" />
          </div>
          <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-[#141b2d] border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Processando raciocínio com {activeAgent.name}...</span>
          </div>
        </div>
      )}

      <div ref={scrollEndRef} />

      {/* Lightbox / Modal for Image Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Visual Preview"
              className="rounded-xl object-contain max-h-[85vh] shadow-2xl border border-slate-700"
            />
          </div>
        </div>
      )}
    </div>
  )
}
