'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Mascota } from '@/types';

export default function MascotasPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [rol, setRol] = useState('');

  useEffect(() => {
    const rolGuardado = localStorage.getItem('rol') ?? '';
    if (!rolGuardado) router.push('/');
    setRol(rolGuardado);
  }, [router]);

  async function buscar() {
    setCargando(true);
    setError('');
    try {
      const res = await fetch(
        `/api/mascotas?nombre=${encodeURIComponent(nombre)}`,
        {
          headers: {
            'x-rol': localStorage.getItem('rol') ?? '',
            'x-vet-id': localStorage.getItem('vetId') ?? '',
          },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Error desconocido');
        return;
      }
      setMascotas(data.mascotas);
    } catch {
      setError('No se pudo conectar al servidor');
    } finally {
      setCargando(false);
    }
  }

  function cerrarSesion() {
    localStorage.clear();
    router.push('/');
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-800">Mascotas</h1>
            <p className="text-sm text-zinc-500">Rol activo: <span className="font-medium">{rol}</span></p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/vacunacion')}
              className="text-sm text-zinc-600 hover:text-zinc-800 underline"
            >
              Ver vacunación pendiente
            </button>
            <button
              onClick={cerrarSesion}
              className="text-sm text-red-500 hover:text-red-700 underline"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscar()}
            placeholder="Buscar por nombre... (ej: Firulais)"
            className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
          <button
            onClick={buscar}
            disabled={cargando}
            className="bg-zinc-800 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {cargando ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {mascotas.length > 0 && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-4 py-3 text-zinc-600 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 text-zinc-600 font-medium">Especie</th>
                  <th className="text-left px-4 py-3 text-zinc-600 font-medium">Dueño</th>
                  <th className="text-left px-4 py-3 text-zinc-600 font-medium">Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {mascotas.map(m => (
                  <tr key={m.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-800">{m.nombre}</td>
                    <td className="px-4 py-3 text-zinc-600 capitalize">{m.especie}</td>
                    <td className="px-4 py-3 text-zinc-600">{m.dueno}</td>
                    <td className="px-4 py-3 text-zinc-600">{m.telefono}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {mascotas.length === 0 && !cargando && nombre && (
          <p className="text-sm text-zinc-500 text-center py-8">
            No se encontraron mascotas con ese nombre.
          </p>
        )}
      </div>
    </main>
  );
}