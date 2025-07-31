'use client'

import { useEffect } from 'react'

export default function TestBasic() {
  useEffect(() => {
    console.log('🔥 REACT FUNCIONA - Si ves esto, React está OK')
    console.log('🌍 ENV VARS:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
    })
  }, [])

  const handleClick = () => {
    console.log('🖱️ CLICK FUNCIONA')
    alert('JavaScript funciona!')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold mb-6">🧪 Test Básico</h1>
        
        <div className="space-y-4">
          <button
            onClick={handleClick}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Probar JavaScript
          </button>
          
          <div className="text-sm space-y-2">
            <p>1. ¿Ves esto renderizado? → React funciona</p>
            <p>2. ¿Click muestra alert? → JS funciona</p>
            <p>3. ¿Console tiene logs? → Console funciona</p>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <p><strong>ENV:</strong></p>
            <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING'}</p>
            <p>KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}