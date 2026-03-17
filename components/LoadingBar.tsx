'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function LoadingBar() {
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
      <div style={{ animation: 'wave 1.2s ease-in-out infinite' }}>
        <Image
          src="/ItabaianaCidadeDoTrabalho.png"
          alt="Itabaiana"
          width={300}
          height={120}
          priority
        />
      </div>
      <style>{`
        @keyframes wave {
          0%, 100% { opacity: 0.2; transform: translateY(0px); }
          50% { opacity: 1; transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}