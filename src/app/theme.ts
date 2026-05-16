import { alpha, createTheme, type Theme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9d4edd',
      light: '#c77dff',
      dark: '#7b2cbf',
      contrastText: '#f5f0ff',
    },
    secondary: {
      main: '#5a189a',
      light: '#7b2cbf',
      dark: '#3c096c',
    },
    background: {
      default: '#0d0b12',
      paper: '#1a1528',
    },
    text: {
      primary: '#ebe6f5',
      secondary: '#a89bb8',
    },
    divider: 'rgba(157, 78, 221, 0.18)',
    action: {
      hover: 'rgba(157, 78, 221, 0.08)',
      selected: 'rgba(157, 78, 221, 0.16)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Oswald", sans-serif' },
    h2: { fontFamily: '"Oswald", sans-serif' },
    h3: { fontFamily: '"Oswald", sans-serif' },
    h4: { fontFamily: '"Oswald", sans-serif' },
    h5: { fontFamily: '"Oswald", sans-serif' },
    h6: { fontFamily: '"Oswald", sans-serif' },
  },
  shape: {
    borderRadius: 1,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0d0b12',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
        notchedOutline: {
          borderRadius: '8px',
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '8px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
})

export const paperCardSx = {
  backgroundColor: 'background.paper',
  borderRadius: '8px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.45)',
} as const

export const loadingOverlaySx = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: (theme: Theme) => alpha(theme.palette.background.default, 0.75),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1300,
} as const

export const accordionSummaryAccentSx = {
  borderLeft: '4px solid',
  borderLeftColor: 'primary.main',
  backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.08),
  '&:hover': {
    backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.14),
  },
  '& .MuiAccordionSummary-content': { alignItems: 'center', py: 0.5 },
} as const

export const accentSurfaceBg = (theme: Theme) => alpha(theme.palette.primary.main, 0.12)
