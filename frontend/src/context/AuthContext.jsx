import React, { createContext, useContext, useState, useEffect } from 'react'

export const PRESET_GOOGLE_ACCOUNTS = [
  {
    id: 'rajesh_kumar',
    name: 'Rajesh Kumar',
    email: 'rajesh.k@nic.in',
    avatarColor: 'linear-gradient(135deg, #1f4fd8, #0f1f54)',
    initials: 'RK',
    role: 'Officer / Verified Citizen',
    badge: 'Aadhaar & DigiLocker Verified',
    verified: true
  },
  {
    id: 'anjali_sharma',
    name: 'Anjali Sharma',
    email: 'anjali.sharma@gmail.com',
    avatarColor: 'linear-gradient(135deg, #0d9488, #115e59)',
    initials: 'AS',
    role: 'Verified Citizen',
    badge: 'DigiLocker KYC Verified',
    verified: true
  },
  {
    id: 'vikram_malhotra',
    name: 'Vikram Malhotra',
    email: 'vikram.m@gmail.com',
    avatarColor: 'linear-gradient(135deg, #ea580c, #9a3412)',
    initials: 'VM',
    role: 'Cyber Advocate',
    badge: 'Citizen Verified',
    verified: true
  }
]

const STORAGE_KEY = 'sangyaan_auth_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed // can be null if signed out
      }
    } catch (e) {
      console.warn('Failed to parse saved user', e)
    }
    // Default to Rajesh Kumar on initial visit as in the original app state
    return PRESET_GOOGLE_ACCOUNTS[0]
  })

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)
  const [authNotification, setAuthNotification] = useState(null)

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(null))
      }
    } catch (e) {
      console.warn('Failed to save auth state', e)
    }
  }, [user])

  const openGoogleModal = () => {
    setIsGoogleModalOpen(true)
  }

  const closeGoogleModal = () => {
    setIsGoogleModalOpen(false)
  }

  const loginWithGoogle = (account) => {
    setUser(account)
    setIsGoogleModalOpen(false)
    setAuthNotification(`Signed in with Google as ${account.name} (${account.email})`)
  }

  const loginWithCustomGoogle = (email, name) => {
    const cleanEmail = email.trim()
    const cleanName = name ? name.trim() : cleanEmail.split('@')[0]
    const initials = cleanName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'U'

    const customUser = {
      id: `custom_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      avatarColor: 'linear-gradient(135deg, #4285F4, #0b57d0)',
      initials,
      role: 'Google Verified User',
      badge: 'Google OAuth Verified',
      verified: true
    }

    setUser(customUser)
    setIsGoogleModalOpen(false)
    setAuthNotification(`Signed in with Google as ${customUser.name}`)
  }

  const logout = () => {
    setUser(null)
    setAuthNotification('Signed out of verified session successfully.')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isGoogleModalOpen,
        openGoogleModal,
        closeGoogleModal,
        loginWithGoogle,
        loginWithCustomGoogle,
        logout,
        authNotification
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
