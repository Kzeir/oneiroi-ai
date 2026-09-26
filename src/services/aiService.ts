import { Agent, GeneratedImage, ImageAttachment, Message } from '../types'

export interface GenerateImageParams {
  prompt: string
  style: string
  aspectRatio: string
  negativePrompt?: string
}

export interface HermesBoard {
  slug: string
  name: string
  running: number
  blocked: number
  ready: number
  done: number
  total: number
}

export interface HermesTask {
  id: string
  title: string
  assignee: string
  status: string
  priority: number
  created_at: string
}

// Configuration accessors
export function get9RouterConfig() {
  const customUrl = localStorage.getItem('oneiroi_9router_url')?.trim()
  const customToken = localStorage.getItem('oneiroi_9router_token')?.trim()

  return {
    url: customUrl || 'http://localhost:20128/v1',
    token: customToken || 'sk-0f5c44b15d24c50c-bvpxjf-3fdde50e',
  }
}

export function getHermesConfig() {
  const customHubUrl = localStorage.getItem('oneiroi_hermes_hub_url')?.trim()
  const customGatewayUrl = localStorage.getItem('oneiroi_hermes_gateway_url')?.trim()

  return {
    hubUrl: customHubUrl || 'http://localhost:9120/api',
    gatewayUrl: customGatewayUrl || 'http://localhost:8642/api',
  }
}

// 1. REAL LIVE AI IMAGE GENERATION (FLUX.1 / SDXL NEURAL NETWORK)
export async function generateAIImage(params: GenerateImageParams): Promise<GeneratedImage> {
  const seed = Math.floor(Math.random() * 1000000)
  
  let width = 1024
  let height = 1024

  if (params.aspectRatio === '16:9') {
    width = 1280
    height = 720
  } else if (params.aspectRatio === '9:16') {
    width = 720
    height = 1280
  } else if (params.aspectRatio === '4:3') {
    width = 1024
    height = 768
  }

  // Enrich prompt with visual style parameters
  const enrichedPrompt = `${params.prompt}, style: ${params.style}, high quality, 8k resolution, photorealistic, detailed lighting, sharp focus`
  const encodedPrompt = encodeURIComponent(enrichedPrompt)

  // Real live AI image generation endpoint (Flux Engine)
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`

  // Pre-load image in background
  await new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = imageUrl
    setTimeout(() => resolve(), 15000)
  })

  return {
    id: `img_${Date.now()}_${seed}`,
    url: imageUrl,
    prompt: params.prompt,
    style: params.style,
    aspectRatio: params.aspectRatio,
    timestamp: Date.now(),
  }
}

// 2. HERMES KANBAN HUB INTEGRATION
export async function fetchHermesBoards(): Promise<HermesBoard[]> {
  const { hubUrl } = getHermesConfig()
  try {
    const res = await fetch(`${hubUrl}/boards`, { method: 'GET' })
    if (res.ok) {
      const data = await res.json()
      return data.boards || []
    }
  } catch (err) {
    console.warn('Hermes Hub fetch boards failed:', err)
  }
  return []
}

export async function fetchHermesBoardTasks(slug: string): Promise<HermesTask[]> {
  const { hubUrl } = getHermesConfig()
  try {
    const res = await fetch(`${hubUrl}/boards/${slug}/tasks`, { method: 'GET' })
    if (res.ok) {
      const data = await res.json()
      return data.tasks || []
    }
  } catch (err) {
    console.warn(`Hermes Hub fetch tasks for board ${slug} failed:`, err)
  }
  return []
}

// Helper to call 9Router OpenAI-compatible endpoint
async function call9Router(
  systemPrompt: string,
  userText: string,
  attachments: ImageAttachment[] = [],
  modelId: string = 'Paid-tier'
): Promise<string | null> {
  const { url, token } = get9RouterConfig()
  const temperature = parseFloat(localStorage.getItem('oneiroi_temp') || '0.7')

  // Possible endpoints to try (direct localhost, netbird ip, or custom)
  const candidateUrls = [
    url,
    'http://localhost:20128/v1',
    'http://127.0.0.1:20128/v1',
    'http://100.99.88.69:20128/v1',
    'https://9route.oneiroigroup.com/v1',
  ]
  const uniqueUrls = Array.from(new Set(candidateUrls))

  for (const baseUrl of uniqueUrls) {
    try {
      // Build message payload
      const userContent: any[] = [{ type: 'text', text: userText || 'Analise e responda com profundidade técnica.' }]
      for (const att of attachments) {
        if (att.url.startsWith('data:') || att.url.startsWith('http')) {
          userContent.push({
            type: 'image_url',
            image_url: { url: att.url },
          })
        }
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 25000)

      const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          temperature,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const textOutput = await response.text()
        
        // Handle Server-Sent Events (SSE) streaming format if returned
        if (textOutput.includes('data:')) {
          const lines = textOutput.split('\n')
          let accumulated = ''
          for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
              try {
                const chunk = JSON.parse(trimmed.slice(6))
                const delta = chunk.choices?.[0]?.delta?.content || chunk.choices?.[0]?.text || ''
                accumulated += delta
              } catch (_) {}
            }
          }
          if (accumulated.trim().length > 0) return accumulated.trim()
        }

        // Handle standard JSON response
        try {
          const data = JSON.parse(textOutput)
          const content = data.choices?.[0]?.message?.content
          if (content) return content
        } catch (_) {}
      }
    } catch (err) {
      // Try next candidate endpoint
      console.warn(`9Router candidate ${baseUrl} failed, trying next...`, err)
    }
  }

  return null
}

// 3. REAL LIVE LLM CALL WITH SYSTEM INSTRUCTION & MULTIMODAL VISION
async function callLiveAI(
  systemPrompt: string,
  userText: string,
  attachments: ImageAttachment[] = [],
  modelId: string = 'Paid-tier'
): Promise<string> {
  // 1. Primary Engine: 9Router Live Multi-Model Network
  const routerResponse = await call9Router(systemPrompt, userText, attachments, modelId)
  if (routerResponse) {
    return routerResponse
  }

  // 2. Direct Google Gemini API Key (if provided by user in Settings)
  const geminiKey = localStorage.getItem('oneiroi_ai_custom_api_key')?.trim()
  if (geminiKey) {
    try {
      const parts: any[] = [{ text: userText || 'Analise o anexo e forneça um parecer completo.' }]
      for (const att of attachments) {
        if (att.url.startsWith('data:')) {
          const match = att.url.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/)
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            })
          }
        }
      }

      const modelTarget = modelId.includes('pro') ? 'gemini-1.5-pro' : 'gemini-1.5-flash'
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelTarget}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts }],
            generationConfig: {
              temperature: parseFloat(localStorage.getItem('oneiroi_temp') || '0.7'),
              maxOutputTokens: 2048,
            },
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (candidate) return candidate
      }
    } catch (err) {
      console.warn('Direct Gemini API call error:', err)
    }
  }

  // 3. Direct OpenRouter API Key (if provided by user in Settings)
  const openRouterKey = localStorage.getItem('oneiroi_openrouter_key')?.trim()
  if (openRouterKey) {
    try {
      let openRouterModel = 'anthropic/claude-3.5-sonnet'
      if (modelId.includes('gpt-4o')) openRouterModel = 'openai/gpt-4o'
      if (modelId.includes('gemini')) openRouterModel = 'google/gemini-flash-1.5'

      const contentPayload: any[] = [{ type: 'text', text: userText }]
      for (const att of attachments) {
        if (att.url.startsWith('data:') || att.url.startsWith('http')) {
          contentPayload.push({
            type: 'image_url',
            image_url: { url: att.url },
          })
        }
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://ai.oneiroigroup.com',
          'X-Title': 'Oneiroi AI',
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: contentPayload },
          ],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const text = data.choices?.[0]?.message?.content
        if (text) return text
      }
    } catch (err) {
      console.warn('OpenRouter API call error:', err)
    }
  }

  // If all connections fail, return actionable diagnostic rather than a fake answer
  const { url } = get9RouterConfig()
  return `### ⚠️ Falha na Conexão com 9Router & Provedores

Não foi possível estabelecer comunicação com o gateway **9Router** em \`${url}\` ou nos provedores configurados.

**Para ativar a IA ao vivo:**
1. **9Router Local / VPN:** Verifique se o container docker do 9Router está ativo na porta \`20128\` ou se você está conectado via **NetBird VPN** (\`100.99.88.69\`).
2. **Chave de API Dedicada:** Abra as **Configurações** (ícone de engrenagem) e insira sua chave do **Google Gemini** ou **OpenRouter**.
3. **Hermes Gateway:** O status dos boards e agentes do Hermes pode ser inspecionado na porta \`9120\`.`
}

// 4. REAL MULTI-AGENT EXECUTION PIPELINE
export async function processAgentResponse(
  userText: string,
  primaryAgent: Agent,
  collaborators: Agent[],
  attachments: ImageAttachment[] = [],
  modelId: string = 'Paid-tier'
): Promise<Message[]> {
  const responses: Message[] = []

  // Execute primary agent live LLM call
  const primaryText = await callLiveAI(
    primaryAgent.systemPrompt,
    userText,
    attachments,
    modelId
  )

  responses.push({
    id: `msg_${Date.now()}_${primaryAgent.id}`,
    role: 'assistant',
    agentId: primaryAgent.id,
    agentName: primaryAgent.name,
    content: primaryText,
    timestamp: Date.now(),
  })

  // If collaborators are present (Multi-Agent Team Mode), execute real collaborative reasoning
  for (const collab of collaborators) {
    const collabSystemPrompt = `${collab.systemPrompt}
Você está atuando em um time multi-agente junto com ${primaryAgent.name} (${primaryAgent.title}).
O agente principal ${primaryAgent.name} acabou de fornecer a seguinte resposta:
"""
${primaryText}
"""
Sua tarefa: Forneça sua perspectiva especializada, análise crítica ou complemento técnico sob a ótica da sua área (${collab.badge}), de forma objetiva, construtiva e prática.`

    const collabText = await callLiveAI(
      collabSystemPrompt,
      `Complemente a análise de ${primaryAgent.name} sobre: "${userText}"`,
      attachments,
      modelId
    )

    responses.push({
      id: `msg_${Date.now()}_${collab.id}`,
      role: 'assistant',
      agentId: collab.id,
      agentName: collab.name,
      content: collabText,
      timestamp: Date.now(),
    })
  }

  return responses
}
