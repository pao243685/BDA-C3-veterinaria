'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const VETERINARIOS = [
  { id: 1, nombre: 'Dr. Fernando López Castro' },
  { id: 2, nombre: 'Dra. Sofía García Velasco' },
  { id: 3, nombre: 'Dr. Andrés Méndez Bravo' },
];

export default function LoginPage() {
  const router = useRouter();
  const [rol, setRol] = useState('recepcionista');
  const [vetId, setVetId] = useState('1');

  function handleEntrar() {
    localStorage.setItem('rol', rol);
    localStorage.setItem('vetId', vetId);
    router.push('/mascotas');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-zinc-800">
          Clínica Veterinaria
        </h1>
        <p className="text-sm text-zinc-500">
          Selecciona tu rol para continuar
        </p>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700">Rol</label>
          <select
            value={rol}
            onChange={e => setRol(e.target.value)}
            className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            <option value="recepcionista">Recepcionista</option>
            <option value="veterinario">Veterinario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {rol === 'veterinario' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700">
              Veterinario
            </label>
            <select
              value={vetId}
              onChange={e => setVetId(e.target.value)}
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              {VETERINARIOS.map(v => (
                <option key={v.id} value={String(v.id)}>
                  {v.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleEntrar}
          className="bg-zinc-800 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          Entrar
        </button>
      </div>
    </main>
  );
}