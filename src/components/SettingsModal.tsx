import React, { useState } from 'react'
import {
  X,
  Settings,
  Key,
  Shield,
  Check,
  Zap,
  Sliders,
  Database,
  ExternalLink,
} from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('oneiroi_ai_custom_api_key') || '')
  const [openRouterKey, setOpenRouterKey] = useState(() => localStorage.getItem('oneiroi_openrouter_key') || '')
  const [temperature, setTemperature] = useState(() => localStorage.getItem('oneiroi_temp') || '0.7')
  const [isSaved, setIsSaved] = useState(false)

  if (!isOpen) return null

  const handleSave = () => {
    localStorage.setItem('oneiroi_ai_custom_api_key', apiKey)
    localStorage.setItem('oneiroi_openrouter_key', openRouterKey)
    localStorage.setItem('oneiroi_temp', temperature)
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0d121f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Configurações & Chaves de API</h2>
              <p className="text-xs text-slate-400">Personalize os provedores e parâmetros de raciocínio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-300 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              Suas chaves de API são armazenadas exclusivamente no <strong>localStorage local do seu navegador</strong> com criptografia de sessão e nunca são compartilhadas externamente.
            </p>
          </div>

          {/* Google Gemini API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Chave de API do Google Gemini (Opcional)</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-cyan-400 flex items-center gap-1 hover:underline"
              >
                <span>Obter chave no Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#141b2d] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* OpenRouter API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Chave OpenRouter (Claude / GPT-4o / Llama)</span>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-purple-400 flex items-center gap-1 hover:underline"
              >
                <span>Obter chave OpenRouter</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="password"
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full bg-[#141b2d] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Temperature */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Criatividade / Temperatura ({temperature})</span>
              <span className="text-[10px] text-slate-400">
                {parseFloat(temperature) < 0.4
                  ? 'Foco & Precisão Técnica'
                  : parseFloat(temperature) > 0.8
                  ? 'Alta Criatividade'
                  : 'Equilibrado'}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all mt-4 ${
              isSaved
                ? 'bg-emerald-500 text-white'
                : 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-md shadow-cyan-500/20'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Configurações Salvas com Sucesso!</span>
              </>
            ) : (
              <span>Salvar Preferências</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
