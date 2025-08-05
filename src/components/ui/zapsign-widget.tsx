"use client"

import { useEffect } from 'react'

interface ZapSignWidgetProps {
  onSigned?: () => void
  onLoaded?: () => void
}

export function ZapSignWidget({ onSigned, onLoaded }: ZapSignWidgetProps) {
  // Direct template URL - no API calls needed
  const templateUrl = "https://app.zapsign.co/verificar/doc/d04d6032-bfab-411a-b754-369e3ca4a3a3"

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: only listen to messages from ZapSign
      if (!event.origin.includes('zapsign.co')) {
        return
      }

      switch (event.data) {
        case 'zs-doc-loaded':
          onLoaded?.()
          break
        case 'zs-doc-signed':
          onSigned?.()
          break
        case 'zs-signed-file-ready':
          // File ready for download
          break
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [onSigned, onLoaded])

  return (
    <iframe
      src={templateUrl}
      width="100%"
      height="800px"
      allow="camera"
      className="border border-black/10 bg-white rounded"
    />
  )
}