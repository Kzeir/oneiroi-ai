import React, { useState } from 'react'
import {
  X,
  Settings,
  Shield,
  Check,
  Zap,
  Sliders,
  Database,
  ExternalLink,
  Cpu,
  Activity,
  Server,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [routerUrl, setRouterUrl] = useState(() => localStorage.getItem('oneiroi_9router_url') || 'http://localhost:20128/v1')
  const [routerToken, setRouterToken] = useState(() => localStorage.getItem('oneiroi_9router_token') || 'sk-0f5c44b15d24c50c-bvpxjf-3fdde50e')
  const [hermesHubUrl, setHermesHubUrl] = useState(() => localStorage.getItem('oneiroi_hermes_hub_url') || 'http://localhost:9120/api')
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('oneiroi_ai_custom_api_key') || '')
  const [openRouterKey, setOpenRouterKey] = useState(() => localStorage.getItem('oneiroi_openrouter_key') || '')
  const [temperature, setTemperature] = useState(() => localStorage.getItem('oneiroi_temp') || '0.7')
  const [isSaved, setIsSaved] = useState(false)

  // Diagnostics state
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<{
    routerStatus: 'idle' | 'success' | 'error'
    routerDetails?: string
    hermesStatus: 'idle' | 'success' | 'error'
    hermesDetails?: string
  }>({
    routerStatus: 'idle',
    hermesStatus: 'idle',
  })

  if (!isOpen) return null

  const handleTestConnection = async () => {
    setIsTesting(true)
    const results = { ...testResults }

    // 1. Test 9Router
    try {
      const cleanUrl = routerUrl.replace(/\/+$/, '')
      const res = await fetch(`${cleanUrl}/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${routerToken}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        const count = data.data?.length || 0
        results.routerStatus = 'success'
        results.routerDetails = `Conectado com sucesso! (${count} modelos disponíveis)`
      } else {
        results.routerStatus = 'error'
        results.routerDetails = `Erro HTTP ${res.status}: ${res.statusText}`
      }
    } catch (err: any) {
      results.routerStatus = 'error'
      results.routerDetails = `Inacessível direto (${err.message || 'CORS/Offline'}). Fallback automático ativo.`
    }

    // 2. Test Hermes Kanban Hub
    try {
      const cleanHub = hermesHubUrl.replace(/\/+$/, '')
      const res = await fetch(`${cleanHub}/boards`, { method: 'GET' })
      if (res.ok) {
        const data = await res.json()
        const count = data.boards?.length || 0
        results.hermesStatus = 'success'
        results.hermesDetails = `Hub Ativo! (${count} boards no pipeline)`
      } else {
        results.hermesStatus = 'error'
        results.hermesDetails = `Erro HTTP ${res.status}`
      }
    } catch (err: any) {
      results.hermesStatus = 'error'
      results.hermesDetails = `Acessível via localhost / NetBird.`
    }

    setTestResults(results)
    setIsTesting(false)
  }

  const handleSave = () => {
    localStorage.setItem('oneiroi_9router_url', routerUrl)
    localStorage.setItem('oneiroi_9router_token', routerToken)
    localStorage.setItem('oneiroi_hermes_hub_url', hermesHubUrl)
    localStorage.setItem('oneiroi_ai_custom_api_key', apiKey)
    localStorage.setItem('oneiroi_openrouter_key', openRouterKey)
    localStorage.setItem('oneiroi_temp', temperature)
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      onClose()
    }, 800)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#0d121f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Configurações de Conexão & IA</h2>
              <p className="text-xs text-slate-400">9Router Gateway, Hermes Hub & Provedores</p>
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
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* 9Router Section */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">9Router Gateway (Principal)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Porta 20128
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Endpoint URL</label>
                <input
                  type="text"
                  value={routerUrl}
                  onChange={(e) => setRouterUrl(e.target.value)}
                  placeholder="http://localhost:20128/v1"
                  className="w-full bg-[#141b2d] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Bearer Token</label>
                <input
                  type="password"
                  value={routerToken}
                  onChange={(e) => setRouterToken(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-[#141b2d] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Hermes Hub Section */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">Hermes Kanban Multi-Board Hub</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Porta 9120
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-300">Hub API URL</label>
              <input
                type="text"
                value={hermesHubUrl}
                onChange={(e) => setHermesHubUrl(e.target.value)}
                placeholder="http://localhost:9120/api"
                className="w-full bg-[#141b2d] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Real-time Diagnostics Button */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Diagnóstico de Conectividade
              </span>
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Testar Conexões</span>
              </button>
            </div>

            {testResults.routerStatus !== 'idle' && (
              <div className="space-y-1 pt-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">9Router (Porta 20128):</span>
                  <span
                    className={
                      testResults.routerStatus === 'success'
                        ? 'text-emerald-400 font-semibold'
                        : 'text-amber-400 font-semibold'
                    }
                  >
                    {testResults.routerDetails}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hermes Kanban (Porta 9120):</span>
                  <span
                    className={
                      testResults.hermesStatus === 'success'
                        ? 'text-emerald-400 font-semibold'
                        : 'text-amber-400 font-semibold'
                    }
                  >
                    {testResults.hermesDetails}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Optional Direct Keys */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Google Gemini API Key (Opcional)</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-cyan-400 flex items-center gap-1 hover:underline"
                >
                  <span>Google AI Studio</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#141b2d] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>OpenRouter API Key (Opcional)</span>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-purple-400 flex items-center gap-1 hover:underline"
                >
                  <span>OpenRouter Keys</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </label>
              <input
                type="password"
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full bg-[#141b2d] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Temperature */}
          <div className="space-y-1.5 pt-1">
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
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 shrink-0">
          <button
            onClick={handleSave}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
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
