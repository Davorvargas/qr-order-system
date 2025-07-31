'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function FinalTest() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('admin@restaurante.com')
  const [password, setPassword] = useState('Admin123!')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Check initial session
    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email)
      if (session?.user) {
        setUser(session.user)
        loadProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    console.log('📋 Current session:', session?.user?.email || 'None')
    if (session?.user) {
      setUser(session.user)
      loadProfile(session.user.id)
    }
  }

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, restaurants(name)')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Profile error:', error)
        setError('Error cargando perfil: ' + error.message)
      } else {
        console.log('✅ Profile loaded:', data)
        setProfile(data)
      }
    } catch (err) {
      console.error('Profile exception:', err)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔑 Logging in:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Login error:', error)
        setError(error.message)
      } else {
        console.log('✅ Login success:', data.user?.email)
        // Don't set user manually - let onAuthStateChange handle it
      }
    } catch (err) {
      console.error('❌ Login exception:', err)
      setError('Error inesperado: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    console.log('👋 Logging out')
    await supabase.auth.signOut()
  }

  const goToDashboard = () => {
    // Use window.location to avoid Next.js routing issues
    window.location.href = '/staff/dashboard'
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-6">🎉 Sesión Activa!</h1>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded">
                <h3 className="font-semibold text-green-800">✅ Usuario Autenticado</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>ID:</strong> {user.id}</p>
                {profile && (
                  <>
                    <p><strong>Role:</strong> {profile.role}</p>
                    <p><strong>Restaurant:</strong> {profile.restaurants?.name}</p>
                  </>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded text-red-700">
                  {error}
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={goToDashboard}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Ir al Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          🔑 Final Test Login
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Con auth state listener y session persistence</p>
        </div>
      </div>
    </div>
  )
}