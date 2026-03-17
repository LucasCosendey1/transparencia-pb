'use client'
import { useEffect } from 'react'
import VLibras from 'vlibras-nextjs'

export default function VLibrasWrapper() {
  useEffect(() => {
    const interval = setInterval(() => {
      const wrapper = document.querySelector('[vw-plugin-wrapper]') as HTMLElement
      if (wrapper) {
        wrapper.style.display = 'none'
        clearInterval(interval)

        const btn = document.querySelector('[vw-access-button]')
        btn?.addEventListener('mouseenter', () => { wrapper.style.display = '' })
        btn?.addEventListener('mouseleave', () => { wrapper.style.display = 'none' })
      }
    }, 300)
    return () => clearInterval(interval)
  }, [])

  return <VLibras forceOnload />
}