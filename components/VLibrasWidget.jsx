//components/VLibrasWidget.jsx

'use client'

import { useEffect } from 'react'

export default function VLibrasWidget() {
  useEffect(() => {
    // Adiciona o div do VLibras manualmente
    const vlibrasDiv = document.createElement('div')
    vlibrasDiv.setAttribute('vw', '')
    vlibrasDiv.className = 'enabled'
    
    const accessButton = document.createElement('div')
    accessButton.setAttribute('vw-access-button', '')
    accessButton.className = 'active'
    
    const pluginWrapper = document.createElement('div')
    pluginWrapper.setAttribute('vw-plugin-wrapper', '')
    
    vlibrasDiv.appendChild(accessButton)
    vlibrasDiv.appendChild(pluginWrapper)
    document.body.appendChild(vlibrasDiv)
    
    // Carrega o script
    const script = document.createElement('script')
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
    script.async = true
    
    script.onload = () => {
      if (window.VLibras) {
        new window.VLibras.Widget('https://vlibras.gov.br/app')
      }
    }
    
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
      if (document.body.contains(vlibrasDiv)) {
        document.body.removeChild(vlibrasDiv)
      }
    }
  }, [])

  return null
}