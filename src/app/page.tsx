"use client"

import { useState, useEffect, Suspense } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Counter } from "@/components/ui/counter"
import { ZapSignWidget } from "@/components/ui/zapsign-widget"

interface CounterResponse {
  count: number
  goal: number
  percentage: number
  lastUpdated: string
}

interface ReferralInfo {
  referrer: {
    name: string
    refCode: string
    createdAt: string
  }
  referralCount: number
}

function HomeContent() {
  const [showWidget, setShowWidget] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  
  // Extract referral code from URL params
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferralCode(ref)
    }
  }, [searchParams])

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

  // Fetch referral info if we have a referral code
  const { data: referralInfo } = useQuery<ReferralInfo>({
    queryKey: ['referral', referralCode],
    queryFn: async () => {
      if (!referralCode) return null
      const response = await fetch(`/api/me?ref=${referralCode}`)
      if (!response.ok) return null
      return response.json()
    },
    enabled: !!referralCode,
  })

  const handleSign = () => {
    setShowWidget(true)
  }

  const handleDocumentSigned = async () => {
    // Prevent duplicate processing
    if (isProcessing) {
      console.log('Already processing signature, ignoring duplicate call')
      return
    }

    setIsProcessing(true)
    
    try {
      // Actually increment the counter in the database
      const response = await fetch('/api/increment-counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          refBy: referralCode 
        }),
      })
      
      if (response.ok) {
        // Refresh the counter display and referral info
        queryClient.invalidateQueries({ queryKey: ['counter'] })
        if (referralCode) {
          queryClient.invalidateQueries({ queryKey: ['referral', referralCode] })
        }
        
        // Show success message
        setShowSuccess(true)
        
        // Hide success message after 3 seconds and go back
        setTimeout(() => {
          setShowSuccess(false)
          setShowWidget(false)
          setIsProcessing(false) // Reset processing state
        }, 3000)
      } else {
        setIsProcessing(false)
      }
    } catch (error) {
      // Silent error handling - just refresh counter anyway
      queryClient.invalidateQueries({ queryKey: ['counter'] })
      setIsProcessing(false)
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
            META: {counterData?.goal.toLocaleString() || '5,000'} FIRMAS
          </p>
        </div>
        
        <Counter 
          count={counterData?.count || 0} 
          goal={counterData?.goal || 5000}
          className="max-w-xs mx-auto"
        />
      </div>

      <div className="mb-6">
        <div className="border border-black/10 bg-white relative">
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

      {referralInfo && (
        <div className="border border-black/10 bg-black/5 p-4 mb-6">
          <div className="text-center space-y-2">
            <p className="text-xs font-mono text-black/80 tracking-wide">
              REFERIDO POR
            </p>
            <p className="text-sm font-mono font-medium text-black">
              {referralInfo.referrer.name}
            </p>
            <p className="text-xs font-mono text-black/60">
              {referralInfo.referralCount} firmas generadas
            </p>
          </div>
        </div>
      )}

      <div className="border-t border-black/10 pt-6 space-y-4">
        <div className="text-center">
          <p className="text-xs text-black/50 font-mono tracking-wide mb-3">
            ÚNETE AL HACKATHON
          </p>
          <a
            href="https://www.colombiatechfest.ai-hackathon.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-black/5 hover:bg-black/10 border border-black/20 text-xs font-mono text-black/80 hover:text-black tracking-wide transition-colors"
          >
            REGÍSTRATE AQUÍ →
          </a>
        </div>

        <div className="text-center">
          <a
            href="/referrals"
            className="inline-block px-4 py-2 bg-black/5 hover:bg-black/10 border border-black/20 text-xs font-mono text-black/80 hover:text-black tracking-wide transition-colors"
          >
            REFERRAL DASHBOARD →
          </a>
        </div>
        
        <div className="text-center">
          <a
            href="https://www.linkedin.com/company/zapsign-br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-mono text-black/60 hover:text-black/80 tracking-wide transition-colors"
          >
            <span>Sigue a</span>
            <span className="font-medium">Zap Sign</span>
            <span>→</span>
          </a>
        </div>
      </div>

    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto px-4 py-8 border-x border-black/10">
        <div className="text-center space-y-6 mb-8">
          <div className="w-56 h-40 mx-auto rounded-2xl overflow-hidden border-2 border-black/20 shadow-lg bg-black/5">
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-xs font-mono text-black/60">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
