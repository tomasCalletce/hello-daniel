"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import { Counter } from "@/components/ui/counter"
import { ZapSignWidget } from "@/components/ui/zapsign-widget"

interface CounterResponse {
  count: number
  goal: number
  percentage: number
  lastUpdated: string
}

export default function Home() {
  const [showWidget, setShowWidget] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const queryClient = useQueryClient()
  
  // Fetch counter data
  const { data: counterData } = useQuery<CounterResponse>({
    queryKey: ['counter'],
    queryFn: async () => {
      const response = await fetch('/api/counter')
      if (!response.ok) throw new Error('Failed to fetch counter')
      return response.json()
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  const handleSign = () => {
    setShowWidget(true)
  }

  const handleDocumentSigned = async () => {
    try {
      // Actually increment the counter in the database
      const response = await fetch('/api/increment-counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (response.ok) {
        // Refresh the counter display
        queryClient.invalidateQueries({ queryKey: ['counter'] })
        
        // Show success message
        setShowSuccess(true)
        
        // Hide success message after 3 seconds and go back
        setTimeout(() => {
          setShowSuccess(false)
          setShowWidget(false)
        }, 3000)
      }
    } catch (error) {
      // Silent error handling - just refresh counter anyway
      queryClient.invalidateQueries({ queryKey: ['counter'] })
    }
  }

  if (showWidget) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 border-x border-black/10">
        <div className="text-center space-y-6 mb-8">
          <div className="space-y-4">
            <div className="w-48 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-black/20 shadow-lg">
              <Image
                src="/daniel_bilbao_image.jpeg"
                alt="Daniel Bilbao"
                width={192}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            
            <h1 className="text-xl font-mono font-medium text-black tracking-tight">
              Firma aquí para que Daniel Bilbao sea juez del IA Hackathon!
            </h1>
            
            <p className="text-xs text-black/60 font-mono tracking-wide">
              FIRMA PARA LOGRAR CONVENCER A DANIEL DE SER JUEZ Y MONTAR LA MEJOR HACKATHON DE LATAM!
            </p>
          </div>
        </div>

        <div className="mb-6">
          <ZapSignWidget 
            onSigned={handleDocumentSigned}
            onLoaded={() => {}}
          />
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowWidget(false)}
            className="text-xs font-mono text-black/80 underline hover:text-black"
          >
            ← Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 border-x border-black/10">
      <div className="text-center space-y-6 mb-8">
        <div className="space-y-6">
          <div className="w-56 h-40 mx-auto rounded-2xl overflow-hidden border-2 border-black/20 shadow-lg">
            <Image
              src="/daniel_bilbao_image.jpeg"
              alt="Daniel Bilbao"
              width={224}
              height={160}
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 className="text-xl font-mono font-medium text-black tracking-tight">
            Firma aquí para que Daniel Bilbao sea juez del IA Hackathon!
          </h1>
          
          <p className="text-xs text-black/60 font-mono tracking-wide">
            FIRMA PARA LOGRAR CONVENCER A DANIEL DE SER JUEZ Y MONTAR LA MEJOR HACKATHON DE LATAM!
          </p>
          
          <p className="text-xs text-black/40 font-mono tracking-wide">
            META: {counterData?.goal.toLocaleString() || '1,000'} FIRMAS
          </p>
        </div>
        
        <Counter 
          count={counterData?.count || 0} 
          goal={counterData?.goal || 1000}
          className="max-w-xs mx-auto"
        />
      </div>

      <div className="mb-6">
        <div className="border border-black/10 bg-white relative">
          <div className="h-2 pattern-diagonal-subtle border-b border-black/5"></div>
          <div className="p-4 border-x border-black/10">
            <button
              onClick={handleSign}
              className="w-full h-12 bg-black hover:bg-black/80 text-white font-mono text-sm tracking-wider transition-colors"
            >
              FIRMAR AHORA
            </button>
          </div>
          <div className="h-1 bg-black/5"></div>
        </div>
      </div>

      <div className="text-center mb-8">
        <p className="text-xs text-black/40 font-mono tracking-wide max-w-xs mx-auto">
          DATOS SOLO PARA INVITAR A DANIEL
        </p>
      </div>

    </div>
  )
}