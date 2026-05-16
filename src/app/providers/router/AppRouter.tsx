import { Box, CircularProgress } from '@mui/material'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { loadingOverlaySx } from '../../theme'
import type { AuthenticatedFetch } from '../../../features/groups/model/attendance'
import { AuthenticatedLayout } from '../../layouts/AuthenticatedLayout'
import { PublicGroupLayout } from '../../layouts/PublicGroupLayout'
import { HomePage } from '../../../pages/home/ui/HomePage'
import { GroupCreatePage } from '../../../pages/groups/create/ui/GroupCreatePage'
import { GroupEditPage } from '../../../pages/groups/edit/ui/GroupEditPage'
import { GroupPublicViewPage } from '../../../pages/groups/view/ui/GroupPublicViewPage'
import { LoginPage, type LoginPageProps } from '../../../pages/login/ui/LoginPage'
import { RequireAuth } from './RequireAuth'

export interface AppRouterProps {
  isAuthChecking: boolean
  isAuthenticated: boolean
  loginPageProps: LoginPageProps
  authenticatedFetch: AuthenticatedFetch
  onLogout: () => void
  isAdmin: boolean
  isTeacher: boolean
  username: string
}

const LoginRoute = (props: { isAuthenticated: boolean; loginPageProps: LoginPageProps }) => {
  const location = useLocation()
  if (props.isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from ?? '/'
    return <Navigate to={from} replace />
  }
  return <LoginPage {...props.loginPageProps} />
}

export const AppRouter = (props: AppRouterProps) => {
  const {
    isAuthChecking,
    isAuthenticated,
    loginPageProps,
    authenticatedFetch,
    onLogout,
    isAdmin,
    isTeacher,
    username,
  } = props

  if (isAuthChecking) {
    return (
      <Box
        sx={loadingOverlaySx}
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <CircularProgress size={48} aria-label="Загрузка" />
      </Box>
    )
  }

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginRoute isAuthenticated={isAuthenticated} loginPageProps={loginPageProps} />}
        />

        <Route element={<PublicGroupLayout />}>
          <Route path="/groups/:groupId/view" element={<GroupPublicViewPage />} />
        </Route>

        <Route element={<RequireAuth isAuthenticated={isAuthenticated} />}>
          <Route
            path="/"
            element={
              <AuthenticatedLayout
                authenticatedFetch={authenticatedFetch}
                onLogout={onLogout}
                isAdmin={isAdmin}
                isTeacher={isTeacher}
                username={username}
              />
            }
          >
            <Route index element={<HomePage />} />
            <Route path="groups/new" element={<GroupCreatePage />} />
            <Route path="groups/:groupId/edit" element={<GroupEditPage />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </HashRouter>
  )
}
