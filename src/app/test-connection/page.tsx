"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

export default function TestConnectionPage() {
  const [status, setStatus] = useState<string>("Testing...");
  const [error, setError] = useState<string>("");
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Mostrar variables de entorno (sin mostrar las claves completas)
        setEnvVars({
          url: process.env.NEXT_PUBLIC_SUPABASE_URL
            ? "✅ Configurado"
            : "❌ No configurado",
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? "✅ Configurado"
            : "❌ No configurado",
          urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL || "No configurado",
          anonKeyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`
            : "No configurado",
        });

        const supabase = createClient();

        // Probar conexión básica sin autenticación
        const { data, error } = await supabase
          .from("profiles")
          .select("count")
          .limit(1);

        if (error) {
          setError(`Error de conexión: ${error.message}`);
          setStatus("❌ Falló");
        } else {
          setStatus("✅ Conectado exitosamente");
        }
      } catch (err: any) {
        setError(`Error: ${err.message}`);
        setStatus("❌ Error");
      }
    };

    testConnection();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test de Conexión Supabase</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Estado de la Conexión</h2>
        <p className="text-lg mb-2">
          Status: <span className="font-bold">{status}</span>
        </p>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Variables de Entorno</h2>
        <div className="space-y-2">
          <p>
            <strong>URL:</strong> {envVars.url}
          </p>
          <p>
            <strong>URL Value:</strong> {envVars.urlValue}
          </p>
          <p>
            <strong>Anon Key:</strong> {envVars.anonKey}
          </p>
          <p>
            <strong>Anon Key Preview:</strong> {envVars.anonKeyPreview}
          </p>
        </div>
      </div>

      <div className="mt-6 space-x-4">
        <a
          href="/login"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Ir al Login
        </a>
        <a
          href="/"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Ir al Inicio
        </a>
      </div>
    </div>
  );
}
