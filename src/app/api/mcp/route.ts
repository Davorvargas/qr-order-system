import { z } from 'zod';
import { createMcpHandler } from '@vercel/mcp-adapter';
import fetch from 'node-fetch';

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN; // Asegúrate de tener esta variable en Vercel

const handler = createMcpHandler(
  (server) => {
    server.tool(
      'get_build_logs',
      'Obtiene los logs de build de un deployment de Vercel',
      { deploymentId: z.string() },
      async ({ deploymentId }) => {
        if (!VERCEL_API_TOKEN) {
          return {
            content: [{ type: 'text', text: 'No VERCEL_API_TOKEN set.' }],
          };
        }
        // Llama a la API de Vercel para obtener los eventos del deployment
        const res = await fetch(
          `https://api.vercel.com/v13/deployments/${deploymentId}/events?build=true`,
          {
            headers: {
              Authorization: `Bearer ${VERCEL_API_TOKEN}`,
            },
          }
        );
        if (!res.ok) {
          return {
            content: [{ type: 'text', text: `Error al obtener logs: ${res.statusText}` }],
          };
        }
        const data = await res.json() as { events: any[] };
        // Puedes formatear los logs como prefieras
        const logs = data.events
          .map((event: any) => `[${event.createdAt}] ${event.payload?.text || event.type}`)
          .join('\n');
        return {
          content: [{ type: 'text', text: logs || 'No hay logs disponibles.' }],
        };
      }
    );
  },
  {},
  { basePath: '/api' }
);

export { handler as GET, handler as POST, handler as DELETE };