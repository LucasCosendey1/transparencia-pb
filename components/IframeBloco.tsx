'use client'

import { useEffect, useRef } from 'react'

interface BlocoIframe {
  iframe_url?: string
  iframe_zoom?: number
  iframe_scroll_y?: number
  iframe_altura?: number
  iframe_largura?: number
}

export default function IframeBloco({ bloco, preview }: { bloco: BlocoIframe; preview?: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const zoom = bloco.iframe_zoom ?? 100
  const scrollY = bloco.iframe_scroll_y ?? 0
  const altura = bloco.iframe_altura ?? 600
  const largura = bloco.iframe_largura ?? 1200

  // Aplica scroll após carregar
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const apply = () => {
      try {
        iframe.contentWindow?.scrollTo({ top: scrollY, behavior: 'instant' })
      } catch {}
    }
    iframe.addEventListener('load', apply)
    return () => iframe.removeEventListener('load', apply)
  }, [scrollY])

  const scale = zoom / 100
  // Container tem a altura visual desejada; o iframe interno é maior e escalonado
  const alturaContainer = preview ? 160 : altura
  const alturaIframe = alturaContainer / scale

  return (
    <div
      style={{
        width: '100%',
        height: alturaContainer,
        overflow: 'hidden',
        position: 'relative',
        borderRadius: preview ? 0 : 8,
      }}
    >
      <iframe
        ref={iframeRef}
        src={bloco.iframe_url}
        style={{
          width: preview ? '100%' : largura,
          height: alturaIframe,
          border: 'none',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: preview ? 'none' : 'auto',
        }}
        title="Portal externo"
        loading="lazy"
      />
    </div>
  )
}