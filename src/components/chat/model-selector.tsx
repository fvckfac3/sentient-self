'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { modelRegistry, ModelId, type ModelConfig } from '@/lib/models'
import { ChevronDown, Sparkles, Lock } from 'lucide-react'

interface ModelSelectorProps {
  selectedModel: ModelId
  onModelChange: (modelId: ModelId) => void
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  
  const userTier = (session?.user as any)?.subscriptionTier || 'FREE'
  
  // Filter models by user's tier
  const availableModels = Object.entries(modelRegistry).filter(
    ([_, config]) => {
      if (userTier === 'FREE') return config.tier === 'FREE'
      return true // Premium/Institution users see all models
    }
  )

  const premiumModelsCount = Object.values(modelRegistry).filter(
    config => config.tier === 'PREMIUM'
  ).length

  const selectedConfig = modelRegistry[selectedModel]

  // Group models by provider
  const groupedModels: Record<string, [string, ModelConfig][]> = {}
  availableModels.forEach(([id, config]) => {
    if (!groupedModels[config.provider]) {
      groupedModels[config.provider] = []
    }
    groupedModels[config.provider].push([id, config])
  })

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Select AI Model"
      >
        <Sparkles className="w-4 h-4 text-purple-600" />
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-500">AI Model</span>
          <span className="text-sm font-medium text-gray-900">{selectedConfig.name}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[500px] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Choose Your AI Model</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {userTier === 'FREE' 
                  ? `Free tier: ${availableModels.length} models available`
                  : `Premium: All ${Object.keys(modelRegistry).length} models unlocked`
                }
              </p>
            </div>

            {/* Model Groups */}
            {Object.entries(groupedModels).map(([provider, models]) => (
              <div key={provider} className="border-b border-gray-100 last:border-b-0">
                <div className="px-4 py-2 bg-gray-50">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    {provider}
                  </span>
                </div>
                
                {models.map(([id, config]) => (
                  <button
                    key={id}
                    onClick={() => {
                      onModelChange(id as ModelId)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                      selectedModel === id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">
                            {config.name}
                          </span>
                          {selectedModel === id && (
                            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {config.description}
                        </p>
                        
                        {config.bestFor && (
                          <p className="text-xs text-purple-600 mt-1.5 font-medium">
                            💡 {config.bestFor}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono">
                            ${config.costPer1kTokens.toFixed(5)}/1K tokens
                          </span>
                          {config.tier === 'FREE' && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">
                              FREE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
            
            {/* Premium Upsell for Free Users */}
            {userTier === 'FREE' && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-t border-purple-200">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Unlock {premiumModelsCount} Premium Models
                    </h4>
                    <p className="text-xs text-gray-700 mt-1">
                      Get access to Claude 3.5 Sonnet (best for therapy), GPT-4o, Gemini Pro, and more.
                    </p>
                    <button className="mt-2 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-md hover:bg-purple-700 transition-colors font-medium">
                      Upgrade to Premium ($14.99/mo)
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Recommendation for Premium Users */}
            {userTier !== 'FREE' && (
              <div className="p-3 bg-purple-50 border-t border-purple-100">
                <p className="text-xs text-purple-900">
                  <strong>💡 Recommended:</strong> Claude 3.5 Sonnet for therapeutic conversations,
                  GPT-4o for complex analytical exercises.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
