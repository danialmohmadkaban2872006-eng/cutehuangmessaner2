import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import LandingPage from '@/pages/LandingPage'
import OnboardingPage from '@/pages/OnboardingPage'
import LoginPage from '@/pages/LoginPage'
import MessengerPage from '@/pages/MessengerPage'
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'
import LoadingScreen from '@/components/ui/LoadingScreen'

function AppRoutes() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/messenger" replace /> : <LandingPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/login" element={user ? <Navigate to="/messenger" replace /> : <LoginPage />} />
      <Route path="/messenger" element={user ? <MessengerPage /> : <Navigate to="/" replace />} />
      <Route path="/messenger/:chatId" element={user ? <MessengerPage /> : <Navigate to="/" replace />} />
      <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/" replace />} />
      <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e1e48',
            color: '#fafafa',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#ff1a4b', secondary: '#fafafa' },
          },
        }}
      />
    </AuthProvider>
  )
}
