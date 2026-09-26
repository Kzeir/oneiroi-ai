import React, { useRef, useState } from 'react'
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  Sparkles,
  X,
  Bot,
  Users,
  Eye,
  Sliders,
} from 'lucide-react'
import { Agent, ImageAttachment } from '../types'

interface InputBoxProps {
  onSendMessage: (text: string, attachments: ImageAttachment[], isImageGenMode: boolean) => void
  activeAgent: Agent
  collaborators: Agent[]
  isThinking: boolean
  onOpenAgentModal: () => void
  onOpenImageStudio: () => void
}

export const InputBox: React.FC<InputBoxProps> = ({
  onSendMessage,
  activeAgent,
  collaborators,
  isThinking,
  onOpenAgentModal,
  onOpenImageStudio,
}) => {
  const [inputText, setInputText] = useState('')
  const [attachments, setAttachments] = useState<ImageAttachment[]>([])
  const [isImageGenMode, setIsImageGenMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if ((!inputText.trim() && attachments.length === 0) || isThinking) return
    onSendMessage(inputText.trim(), attachments, isImageGenMode)
    setInputText('')
    setAttachments([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        const sizeFormatted = `${(file.size / 1024).toFixed(1)} KB`
        setAttachments((prev) => [
          ...prev,
          {
            id: `att_${Date.now()}_${Math.random()}`,
            url,
            name: file.name,
            size: sizeFormatted,
            type: file.type,
          },
        ])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
  }

  return (
    <div className="p-3 sm:p-4 bg-[#0d121f]/95 border-t border-slate-800/80 backdrop-blur-md shrink-0">
      <div className="max-w-3xl mx-auto space-y-2.5">
        {/* Attachments Preview Row */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-1">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 p-1.5 pr-2 rounded-lg bg-slate-800/90 border border-slate-700 text-xs text-slate-200 shadow-md group"
              >
                <img src={att.url} alt={att.name} className="w-8 h-8 rounded object-cover" />
                <div className="max-w-[120px] truncate">
                  <p className="font-medium truncate text-[11px]">{att.name}</p>
                  <p className="text-[9px] text-slate-400">{att.size}</p>
                </div>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Mode Indicators & Active Team Bar */}
        <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImageGenMode(!isImageGenMode)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all ${
                isImageGenMode
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20'
                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/50'
              }`}
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Modo Imagem (Prompt Artist)</span>
            </button>

            {attachments.length > 0 && (
              <span className="flex items-center gap-1 text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                <Eye className="w-3 h-3" />
                <span>Modo Visão Ativo</span>
              </span>
            )}
          </div>

          {collaborators.length > 0 && (
            <div
              onClick={onOpenAgentModal}
              className="hidden sm:flex items-center gap-1 text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30 cursor-pointer hover:bg-purple-500/20"
            >
              <Users className="w-3 h-3" />
              <span>Time: {collaborators.length + 1} Agentes</span>
            </div>
          )}
        </div>

        {/* Input Bar Container */}
        <div className="relative rounded-2xl bg-[#141b2d] border border-slate-700/80 focus-within:border-cyan-500/60 focus-within:ring-2 focus-within:ring-cyan-500/20 shadow-xl transition-all">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInputResize}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={
              isImageGenMode
                ? 'Descreva a imagem que deseja gerar (ex: Cyberpunk city in rain, neon cyan, 8k render)...'
                : `Converse com ${activeAgent.name} ou envie imagens para análise...`
            }
            className="w-full bg-transparent px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-40 scrollbar-none"
          />

          {/* Action Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5">
              {/* File / Vision Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-all"
                title="Anexar Imagem para Análise de Visão"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Image Studio Shortcut */}
              <button
                type="button"
                onClick={onOpenImageStudio}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-purple-400 transition-all"
                title="Abrir Estúdio de Imagens"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Multi-Agent Selector Shortcut */}
              <button
                type="button"
                onClick={onOpenAgentModal}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-all"
                title="Selecionar Agentes Colaboradores"
              >
                <Bot className="w-4 h-4" />
              </button>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSubmit}
              disabled={(!inputText.trim() && attachments.length === 0) || isThinking}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all ${
                (!inputText.trim() && attachments.length === 0) || isThinking
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20 hover:scale-105 active:scale-95'
              }`}
            >
              <span>Enviar</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 text-center">
          Oneiroi AI Intelligence Platform • Pressione <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-400">Enter</kbd> para enviar ou <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-400">Shift+Enter</kbd> para nova linha.
        </p>
      </div>
    </div>
  )
}
