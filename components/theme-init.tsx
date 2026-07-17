'use client'

import { useEffect } from 'react'

export function ThemeInit() {
  useEffect(() => {
    try {
      const theme = localStorage.getItem('theme') || localStorage.getItem('next-themes-theme') || 'light'
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (e) {
      // localStorage might not be available
    }
  }, [])

  return null
}
