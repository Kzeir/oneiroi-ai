import React, { useState } from 'react'
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Download,
  Wand2,
  Maximize2,
  RefreshCw,
  Send,
  Sliders,
  Layers,
} from 'lucide-react'
import { GeneratedImage } from '../types'
import { generateAIImage } from '../services/aiService'

interface ImageStudioModalProps {
  isOpen: boolean
  onClose: () => void
  onSendImageToChat: (image: GeneratedImage) => void
}

const STYLES = [
  { id: 'Cyberpunk Neon', name: 'Cyberpunk Neon', desc: 'Luzes neon, estética futurista ciano e magenta' },
  { id: 'Cinematic 3D', name: 'Cinematic 3D', desc: 'Render Octane fotorrealista 8K com profundidade de campo' },
  { id: 'Realistic Photo', name: 'Fotografia Realista', desc: 'Câmera DSLR 85mm f/1.8 com iluminação natural de estúdio' },
  { id: 'Minimalist Vector', name: 'Vetor Minimalista', desc: 'Ilustração flat moderna para interfaces e produtos' },
  { id: 'Anime & Concept Art', name: 'Anime Concept Art', desc: 'Estilo estúdio japonês de alta definição' },
  { id: 'Dark Fantasy', name: 'Dark Fantasy', desc: 'Atmosfera sombria e épica estilo RPG e mitologia' },
]

const ASPECT_RATIOS = [
  { id: '1:1', name: '1:1 Quadrado', label: 'Instagram / Feed' },
  { id: '16:9', name: '16:9 Paisagem', label: 'YouTube / Banner' },
  { id: '9:16', name: '9:16 Retrato', label: 'Stories / Reels / TikTok' },
  { id: '4:3', name: '4:3 Clássico', label: 'Apresentações' },
]

export const ImageStudioModal: React.FC<ImageStudioModalProps> = ({
  isOpen,
  onClose,
  onSendImageToChat,
}) => {
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id)
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[1].id)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([
    {
      id: 'demo_1',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1024&h=576&q=80',
      prompt: 'Cyberpunk neural command center with glowing neon holographic screens and glassmorphism',
      style: 'Cyberpunk Neon',
      aspectRatio: '16:9',
      timestamp: Date.now() - 100000,
    },
  ])

  if (!isOpen) return null

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return
    setIsGenerating(true)
    try {
      const result = await generateAIImage({
        prompt: prompt.trim(),
        style: selectedStyle,
        aspectRatio: selectedRatio,
      })
      setGeneratedImages((prev) => [result, ...prev])
    } catch (err) {
      console.error('Image gen error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0d121f] border border-purple-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Oneiroi Visual Studio — Geração de Imagens
              </h2>
              <p className="text-xs text-purple-300">
                Criação de concept art, renders 3D e peças visuais de alta definição
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

        {/* Content Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Prompt Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Descrição Visual (Prompt)</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Descreva o que deseja criar (ex: Futuristic cyberpunk AI server room in neon cyan, volumetric dust, 8k resolution, octane render)..."
                className="w-full bg-[#141b2d] border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/40 resize-none"
              />
            </div>

            {/* Style Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Estilo Visual</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      selectedStyle === style.id
                        ? 'bg-purple-500/20 border-purple-500 text-purple-200 shadow-sm'
                        : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <p className="font-semibold truncate">{style.name}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Proporção (Aspect Ratio)</label>
              <div className="grid grid-cols-2 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setSelectedRatio(ratio.id)}
                    className={`p-2 rounded-lg border text-left text-xs transition-all ${
                      selectedRatio === ratio.id
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                        : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <p className="font-semibold">{ratio.name}</p>
                    <p className="text-[9px] text-slate-400">{ratio.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                !prompt.trim() || isGenerating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gerando Imagem com IA...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Gerar Imagem de Alta Resolução</span>
                </>
              )}
            </button>
          </div>

          {/* Right Gallery Showcase (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Galeria de Gerações Recentes ({generatedImages.length})
              </h3>
            </div>

            <div className="space-y-4">
              {generatedImages.map((img) => (
                <div
                  key={img.id}
                  className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/60 p-3 space-y-3 shadow-lg"
                >
                  <div className="relative group rounded-lg overflow-hidden bg-slate-900">
                    <img src={img.url} alt={img.prompt} className="w-full max-h-72 object-cover" />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-purple-300 font-mono">
                      <span>{img.aspectRatio}</span>
                      <span>•</span>
                      <span>{img.style}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-300 truncate max-w-sm">{img.prompt}</p>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onSendImageToChat(img)
                          onClose()
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium flex items-center gap-1 transition-all"
                        title="Enviar para o Chat Principal"
                      >
                        <Send className="w-3 h-3" />
                        <span>Usar no Chat</span>
                      </button>

                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                        title="Baixar Imagem"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
