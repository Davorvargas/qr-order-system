'use client'

import { useEffect, useState } from 'react'

export default function TestSupabase() {
  const [logs, setLogs] = useState<string[]>([])
  const [supabase, setSupabase] = useState<any>(null)

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, message])
  }

  useEffect(() => {
    testSupabase()
  }, [])

  const testSupabase = async () => {
    try {
      addLog('🔥 Iniciando test de Supabase...')

      // Test 1: Import Supabase
      addLog('📦 Importando @supabase/supabase-js...')
      const { createClient } = await import('@supabase/supabase-js')
      addLog('✅ Import exitoso')

      // Test 2: Create client
      addLog('🔧 Creando cliente Supabase...')
      const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      setSupabase(supabaseClient)
      addLog('✅ Cliente creado')

      // Test 3: Simple query (should work even without auth)
      addLog('🔍 Probando query simple...')
      const { data, error } = await supabaseClient
        .from('restaurants')
        .select('name')
        .limit(1)

      if (error) {
        addLog('❌ Error en query: ' + error.message)
      } else {
        addLog('✅ Query exitosa: ' + JSON.stringify(data))
      }

      // Test 4: Auth test
      addLog('👤 Probando getUser...')
      const { data: userData, error: userError } = await supabaseClient.auth.getUser()
      
      if (userError) {
        addLog('❌ Error getUser: ' + userError.message)
      } else {
        addLog('✅ getUser exitoso: ' + (userData.user ? userData.user.email : 'No user'))
      }

    } catch (error) {
      addLog('💥 Error fatal: ' + (error as Error).message)
      console.error('Error completo:', error)
    }
  }

  const testLogin = async () => {
    if (!supabase) {
      addLog('❌ No hay cliente Supabase')
      return
    }

    try {
      addLog('🔑 Probando login...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@restaurante.com',
        password: 'Admin123!'
      })

      if (error) {
        addLog('❌ Login error: ' + error.message)
      } else {
        addLog('✅ Login exitoso: ' + data.user?.email)
      }
    } catch (error) {
      addLog('💥 Login crash: ' + (error as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">🧪 Test Supabase</h1>
          
          <button
            onClick={testLogin}
            className="mb-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            disabled={!supabase}
          >
            Probar Login Manual
          </button>

          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}