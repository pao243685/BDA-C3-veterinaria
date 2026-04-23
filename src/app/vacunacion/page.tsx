'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { MascotaPendiente } from '@/types';

export default function VacunacionPage() {
  const router = useRouter();
  const [mascotas, setMascotas] = useState<MascotaPendiente[]>([]);
  const [fuente, setFuente] = useState('');
  const [cargando, setCargando] = useState(false);
  const [rol, setRol] = useState('');

  useEffect(() => {
    const rolGuardado = localStorage.getItem('rol') ?? '';
    if (!rolGuardado) {
      router.push('/');
      return;
    }
    setRol(rolGuardado);
    cargar();
  }, [router]);

  async function cargar() {
    setCargando(true);
    try {
      const res = await fetch('/api/vacunacion-pendiente', {
        headers: {
          'x-rol': localStorage.getItem('rol') ?? '',
          'x-vet-id': localStorage.getItem('vetId') ?? '',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setMascotas(data.mascotas);
        setFuente(data.fuente);
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-800">
              Vacunación pendiente
            </h1>
            <p className="text-sm text-zinc-500">
              Rol activo: <span className="font-medium">{rol}</span>
            </p>
          </div>
          <button
            onClick={() => router.push('/mascotas')}
            className="text-sm text-zinc-600 hover:text-zinc-800 underline"
          >
            ← Volver
          </button>
        </div>

        {fuente && (
          <div className={`text-xs font-medium px-3 py-1 rounded-full w-fit ${
            fuente === 'cache'
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {fuente === 'cache' ? 'CACHE HIT' : 'BASE DE DATOS'}
          </div>
        )}

        <button
          onClick={cargar}
          disabled={cargando}
          className="bg-zinc-800 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors w-fit"
        >
          {cargando ? 'Consultando' : 'Actualizar'}
        </button>

        {mascotas.length > 0 ? (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-4 py-3 text-zinc-600 font-medium">ID</th>
                  <th className="text-left px-4 py-3 text-zinc-600 font-medium">Nombre</th>
                </tr>
              </thead>
              <tbody>
                {mascotas.map(m => (
                  <tr key={m.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="px-4 py-3 text-zinc-500">{m.id}</td>
                    <td className="px-4 py-3 font-medium text-zinc-800">{m.nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 text-center py-8">
            {cargando ? 'Cargando' : 'Todas las mascotas tienen vacunas al día.'}
          </p>
        )}
      </div>
    </main>
  );
}