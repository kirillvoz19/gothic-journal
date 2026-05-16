import { useState, useEffect, useRef } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { appTheme } from './app/theme'
import { getJwtExpiryMs, getJwtPayload } from './shared/lib/auth/jwt'
import {
  clearTokensFromStorage,
  readAccessTokenFromStorage,
  readRefreshTokenFromStorage,
  writeTokensToStorage,
  type AuthTokens,
} from './shared/lib/auth/tokens'
import { getApiUrl, getSupabaseRequestHeaders, isSupabaseBackend } from './shared/lib/api/baseUrl'
import { AppRouter } from './app/providers/router/AppRouter'
import type { LoginPageProps } from './pages/login/ui/LoginPage'

function App() {
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'error',
  })

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  const refreshTimerRef = useRef<number | null>(null)
  const refreshInFlightRef = useRef<Promise<boolean> | null>(null)

  const jwtPayload = accessToken ? getJwtPayload(accessToken) : null
  const isAdmin = !!accessToken && jwtPayload?.role === 'admin'
  const isTeacher = !!accessToken && jwtPayload?.role === 'teacher'
  const authUsername = jwtPayload?.username ?? ''

  const TOKEN_REFRESH_EARLY_MS = 2 * 60 * 1000
  const MIN_REFRESH_RETRY_DELAY_MS = 1000

  // Проверка авторизации при загрузке
  useEffect(() => {
    const storedAccessToken = readAccessTokenFromStorage()
    const storedRefreshToken = readRefreshTokenFromStorage()

    if (storedAccessToken && storedRefreshToken) {
      setAccessToken(storedAccessToken)
      setIsAuthenticated(true)
      // Проверяем валидность токена (в фоне)
      void checkTokenAndRefresh(storedAccessToken)
    }
    setIsAuthChecking(false)
  }, [])

  // Настройка автоматического обновления токена
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      setupTokenRefresh(accessToken)
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
    }
  }, [isAuthenticated, accessToken])

  // Проверка и обновление токена
  const checkTokenAndRefresh = async (token: string) => {
    const expiresAtMs = getJwtExpiryMs(token)
    if (!expiresAtMs) {
      await refreshAccessToken()
      return
    }

    const nowMs = Date.now()
    if (expiresAtMs - nowMs < TOKEN_REFRESH_EARLY_MS) {
      await refreshAccessToken()
    }
  }

  // Настройка автоматического обновления токена
  const setupTokenRefresh = (token: string) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
    }

    const expiresAtMs = getJwtExpiryMs(token)
    if (!expiresAtMs) return

    const nowMs = Date.now()
    const refreshInMs = expiresAtMs - nowMs - TOKEN_REFRESH_EARLY_MS

    if (refreshInMs > 0) {
      refreshTimerRef.current = window.setTimeout(() => {
        void refreshAccessToken()
      }, refreshInMs)
      return
    }

    // Токен уже "на пороге" истечения — рефрешим один раз,
    // но не допускаем рекурсивного каскада.
    refreshTimerRef.current = window.setTimeout(() => {
      void refreshAccessToken()
    }, MIN_REFRESH_RETRY_DELAY_MS)
  }

  // Обновление access токена
  const refreshAccessToken = async () => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current
    }

    const storedRefreshToken = readRefreshTokenFromStorage()
    if (!storedRefreshToken) {
      handleLogout()
      return false
    }

    const runRefresh = async (): Promise<boolean> => {
      try {
        const response = await fetch(getApiUrl('/api/auth/refresh'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getSupabaseRequestHeaders(),
          },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        })

        if (!response.ok) {
          handleLogout()
          return false
        }

        const data = (await response.json()) as AuthTokens
        if (!data.accessToken || !data.refreshToken) {
          handleLogout()
          return false
        }

        setAccessToken(data.accessToken)
        writeTokensToStorage(data)
        setupTokenRefresh(data.accessToken)
        return true
      } catch (error) {
        console.error('Error refreshing token:', error)
        handleLogout()
        return false
      }
    }

    const refreshPromise = runRefresh().finally(() => {
      refreshInFlightRef.current = null
    })

    refreshInFlightRef.current = refreshPromise
    return refreshPromise
  }

  // Выход
  const handleLogout = () => {
    setIsAuthenticated(false)
    setAccessToken(null)
    clearTokensFromStorage()
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
    }
  }

  // Логин
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const response = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getSupabaseRequestHeaders(),
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = (await response.json()) as AuthTokens
        setAccessToken(data.accessToken)
        setIsAuthenticated(true)
        writeTokensToStorage(data)
        setUsername('')
        setPassword('')
        setupTokenRefresh(data.accessToken)
      } else {
        const errorData = await response.json() as { error: string }
        const errorMessage = errorData.error || 'Invalid credentials'
        setLoginError(errorMessage)
        showSnackbar(errorMessage, 'error')
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = 'Failed to login. Please try again.'
      setLoginError(errorMessage)
      showSnackbar(errorMessage, 'error')
    } finally {
      setLoginLoading(false)
    }
  }

  // Запрос с автоматическим обновлением токена при 401
  const authenticatedFetch = async (
    url: string,
    options: RequestInit = {}
  ) => {
    const resolvedUrl = getApiUrl(url)
    // Никогда не запускаем refresh из самого refresh-endpoint
    if (resolvedUrl.includes('/refresh')) {
      return fetch(resolvedUrl, options)
    }

    const token = readAccessTokenFromStorage()
    if (!token) {
      handleLogout()
      throw new Error('Not authenticated')
    }

    const response = await fetch(resolvedUrl, {
      ...options,
      headers: {
        ...options.headers,
        ...(isSupabaseBackend() ? getSupabaseRequestHeaders(token) : { Authorization: `Bearer ${token}` }),
      },
    })

    // Если получили 401, пробуем обновить токен
    if (response.status === 401) {
      const didRefreshSucceed = await refreshAccessToken()
      if (!didRefreshSucceed) {
        throw new Error('Authentication failed')
      }

      const newToken = readAccessTokenFromStorage()
      if (!newToken) {
        handleLogout()
        throw new Error('Authentication failed')
      }

      const retriedResponse = await fetch(resolvedUrl, {
        ...options,
        headers: {
          ...options.headers,
          ...(isSupabaseBackend() ? getSupabaseRequestHeaders(newToken) : { Authorization: `Bearer ${newToken}` }),
        },
      })

      if (retriedResponse.status === 401) {
        handleLogout()
        throw new Error('Authentication failed')
      }

      return retriedResponse
    }

    return response
  }

  const loginPageProps: LoginPageProps = {
    username,
    password,
    loginError,
    loginLoading,
    snackbar,
    onUsernameChange: setUsername,
    onPasswordChange: setPassword,
    onSubmit: handleLogin,
    onCloseSnackbar: handleCloseSnackbar,
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AppRouter
        isAuthChecking={isAuthChecking}
        isAuthenticated={isAuthenticated}
        loginPageProps={loginPageProps}
        authenticatedFetch={authenticatedFetch}
        onLogout={handleLogout}
        isAdmin={isAdmin}
        isTeacher={isTeacher}
        username={authUsername}
      />
    </ThemeProvider>
  )
}

export default App
