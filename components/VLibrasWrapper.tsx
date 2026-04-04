'use client'
import { useEffect } from 'react'
import VLibras from 'vlibras-nextjs'

export default function VLibrasWrapper() {
  useEffect(() => {
  const interval = setInterval(() => {
    // Pega todos os elementos fixed/absolute da página que não são do nosso site
    document.querySelectorAll('body > div, body > section, body > aside').forEach(el => {
      const htmlEl = el as HTMLElement
      const style = window.getComputedStyle(htmlEl)
      if (
        (style.position === 'fixed' || style.position === 'absolute') &&
        !htmlEl.id?.includes('mobile-menu') &&
        !htmlEl.closest('header') &&
        !htmlEl.closest('main') &&
        !htmlEl.closest('footer') &&
        (
          htmlEl.innerHTML?.includes('vp-') ||
          htmlEl.innerHTML?.includes('vlibras') ||
          htmlEl.className?.includes('vp-') ||
          htmlEl.id?.includes('vp-') ||
          htmlEl.id?.includes('vlibras')
        )
      ) {
        htmlEl.style.top = '-9999px'
        htmlEl.style.left = '-9999px'
      }
    })
  }, 200)
  return () => clearInterval(interval)
}, [])

  return <VLibras forceOnload />
}