import { create } from 'zustand'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
}

interface AuthStore {
  user: User | null
  token: string | null
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('auth_token', token)
    set({ token })
  },
  logout: () => {
    localStorage.removeItem('auth_token')
    set({ user: null, token: null })
  },
}))