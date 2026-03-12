'use client'

import { useEffect, useState } from 'react'

export default function AdminInactivityLogout() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Verificar se é admin
    const adminStatus = localStorage.getItem('isAdmin') === 'true'
    setIsAdmin(adminStatus)
  }, [])

  useEffect(() => {
    if (!isAdmin) return

    let inactivityTimer: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(inactivityTimer)
      
      inactivityTimer = setTimeout(() => {
        localStorage.removeItem('isAdmin')
        localStorage.removeItem('adminToken')
        window.location.reload()
      }, 1800000) //  30 minutos de inatividade
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true)
    })

    resetTimer()

    return () => {
      clearTimeout(inactivityTimer)
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true)
      })
    }
  }, [isAdmin])

  return null
}