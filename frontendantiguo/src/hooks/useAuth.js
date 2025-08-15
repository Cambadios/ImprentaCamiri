import { createContext, useContext, useState } from 'react'
import api from '../api/client'
import { endpoints } from '../api/endpoints'
import { useNavigate } from 'react-router-dom'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const nav = useNavigate()
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function login(correo, contrasena) {
    setLoading(true); setError('')
    try {
      const { data } = await api.post(endpoints.login, { correo, contrasena })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.usuario))
      setUser(data.usuario)
      nav('/', { replace: true })
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally { setLoading(false) }
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    nav('/login', { replace: true })
  }

  return (
    <AuthCtx.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  return useContext(AuthCtx)
}