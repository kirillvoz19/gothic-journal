import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { paperCardSx } from '../../../app/theme'
import { BelarusianText } from '../../../components/BelarusianText'

export interface LoginPageProps {
  username: string
  password: string
  loginError: string
  loginLoading: boolean
  snackbar: { open: boolean; message: string; severity: 'success' | 'error' }
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCloseSnackbar: () => void
}

export const LoginPage = (props: LoginPageProps) => {
  const {
    username,
    password,
    loginError,
    loginLoading,
    snackbar,
    onUsernameChange,
    onPasswordChange,
    onSubmit,
    onCloseSnackbar,
  } = props

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container sx={{ width: '400px' }}>
        <Paper
          elevation={0}
          sx={{
            ...paperCardSx,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderRadius: '16px',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            <BelarusianText belarusian="Уваход" russian="Вход" />
          </Typography>

          {loginError && (
            <Alert severity="error">
              <BelarusianText belarusian="Памылка ўваходу" russian="Ошибка входа" />
              : {loginError}
            </Alert>
          )}

          <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Tooltip title="Логин" arrow>
              <TextField
                label="Лагін"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                required
                fullWidth
              />
            </Tooltip>
            <Tooltip title="Пароль" arrow>
              <TextField
                label="Пароль"
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                required
                fullWidth
              />
            </Tooltip>
            <Button
              type="submit"
              variant="contained"
              disabled={loginLoading}
              fullWidth
              sx={{ mt: 2 }}
            >
              {loginLoading ? (
                <BelarusianText belarusian="Уваход..." russian="Вход..." />
              ) : (
                <BelarusianText belarusian="Увайсці" russian="Войти" />
              )}
            </Button>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={onCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={onCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
