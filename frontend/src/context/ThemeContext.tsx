import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

// reads the user's saved preference from localStorage, falling back to
// their system preference if no saved preference exists.
function getInitialTheme(): Theme {
  const saved = localStorage.getItem('studyhub-theme') as Theme | null
  if (saved === 'light' || saved === 'dark') return saved

  // no saved preference — use system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  // apply the theme to the document root and persist to localStorage
  // whenever the theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('studyhub-theme', theme)
  }, [theme])

  // also listen for system preference changes in case the user hasn't
  // set a manual preference yet
  useEffect(() => {
    const saved = localStorage.getItem('studyhub-theme')
    if (saved) return // user has a manual preference, don't override it

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// custom hook for consuming the theme context anywhere in the app
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}