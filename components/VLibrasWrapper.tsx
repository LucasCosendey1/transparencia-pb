'use client'
import { useEffect } from 'react'
import VLibras from 'vlibras-nextjs'

export default function VLibrasWrapper() {
 useEffect(() => {
  const interval = setInterval(() => {
    const popup = document.querySelector('.vp-pop-up') as HTMLElement
    if (popup) {
      popup.style.visibility = 'hidden'
      popup.style.width = '0'
      popup.style.height = '0'
      clearInterval(interval)
    }
  }, 300)
  return () => clearInterval(interval)
}, [])

  return <VLibras forceOnload />
}