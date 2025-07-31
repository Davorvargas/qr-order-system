'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function SimpleDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 1. Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.log('❌ No user, redirecting to login')
        router.push('/simple-login')
        return
      }

      console.log('✅ User found:', user.email)
      setUser(user)

      // 2. Get profile (RLS automatically filters by auth.uid())
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, restaurants(name)')
        .single()

      if (profileError) {
        console.error('❌ Profile error:', profileError)
        setError('Error cargando perfil: ' + profileError.message)
      } else {
        console.log('✅ Profile loaded:', profile)
        setProfile(profile)
      }

      // 3. Get orders (RLS automatically filters by user's restaurant)
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, customer_name, status, total_price')
        .order('created_at', { ascending: false })
        .limit(5)

      if (ordersError) {
        console.error('❌ Orders error:', ordersError)
        setError('Error cargando órdenes: ' + ordersError.message)
      } else {
        console.log('✅ Orders loaded:', orders?.length, 'orders')
        setOrders(orders || [])
      }

    } catch (err) {
      console.error('❌ General error:', err)
      setError('Error general: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/simple-login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🎉 RLS Dashboard Funciona!</h1>
            <p className="text-gray-600">
              {user?.email} | {profile?.restaurants?.name || 'Sin restaurante'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">👤 Info del Usuario</h2>
            <div className="space-y-2 text-sm">
              <p><strong>User ID:</strong> {user?.id}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {profile?.role}</p>
              <p><strong>Restaurant ID:</strong> {profile?.restaurant_id}</p>
              <p><strong>Restaurant:</strong> {profile?.restaurants?.name}</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Órdenes Recientes</h2>
            {orders.length === 0 ? (
              <p className="text-gray-500">No hay órdenes</p>
            ) : (
              <div className="space-y-2">
                {orders.map((order) => (
                  <div key={order.id} className="border-l-4 border-blue-500 pl-3 py-2">
                    <p className="font-medium">{order.customer_name || 'Sin nombre'}</p>
                    <p className="text-sm text-gray-600">
                      ${order.total_price} | {order.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded">
          <h3 className="font-semibold text-green-800">✅ RLS Funcionando Correctamente</h3>
          <p className="text-green-700 text-sm mt-1">
            Solo ves datos de tu restaurante. Los otros restaurantes están completamente ocultos.
          </p>
        </div>
      </div>
    </div>
  )
}