import { Navigate, Outlet, useLocation } from 'react-router-dom'

export interface RequireAuthProps {
  isAuthenticated: boolean
}

export const RequireAuth = (props: RequireAuthProps) => {
  const { isAuthenticated } = props
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
