'use client'
import { useEffect } from 'react'
import VLibras from 'vlibras-nextjs'

export default function VLibrasWrapper() {
  useEffect(() => {
    const interval = setInterval(() => {
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
          if (document.body.contains(htmlEl)) {
            htmlEl.remove()
          }
        }
      })
    }, 200)
    return () => clearInterval(interval)
  }, [])

  return <VLibras forceOnload />
}