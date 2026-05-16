import { Box, Container } from '@mui/material'
import { Outlet } from 'react-router-dom'

export const PublicGroupLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 5, sm: 6 } }}>
        <Outlet />
      </Container>
    </Box>
  )
}
