"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { User } from '@/types/auth'
import toast from 'react-hot-toast'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = apiClient.getAccessToken()
      if (!token) {
        setLoading(false)
        return
      }

      const response = await apiClient.getCurrentUser()
      setUser(response)
    } catch (error) {
      apiClient.clearAuthTokens()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, user_type: string) => {
    try {
      const response = await apiClient.login({
        email,
        password,
        user_type,
      })
      
      apiClient.setAuthTokens(response.access_token, response.refresh_token)
      
      await checkAuth()
      
      // Redirect based on user type
      router.push(`/dashboard/${user_type}`)
      
      toast.success('Login successful!')
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  const register = async (data: any) => {
    try {
      await apiClient.registerStudent(data)
      toast.success('Registration successful! Please login.')
      router.push('/auth/login')
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed'
      toast.error(message)
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      apiClient.clearAuthTokens()
      setUser(null)
      router.push('/auth/login')
      toast.success('Logged out successfully')
    }
  }

  return { user, loading, login, register, logout, checkAuth }
}
