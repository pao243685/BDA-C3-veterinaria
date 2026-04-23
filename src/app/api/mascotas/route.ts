import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getRolePg } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nombre    = searchParams.get('nombre') ?? '';
  const rol       = req.headers.get('x-rol') ?? '';
  const vetIdRaw  = req.headers.get('x-vet-id') ?? '';

  let vetIdNum: number | null = null;
  if (rol === 'veterinario') {
    vetIdNum = parseInt(vetIdRaw, 10);
    if (isNaN(vetIdNum) || vetIdNum <= 0 || String(vetIdNum) !== vetIdRaw.trim()) {
      return NextResponse.json({ error: 'x-vet-id inválido' }, { status: 400 });
    }
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL ROLE ${getRolePg(rol)}`);

    if (rol === 'veterinario' && vetIdNum !== null) {
      await client.query('SELECT set_config($1, $2, true)', [
        'app.current_vet_id',
        String(vetIdNum),
      ]);
    }

    const result = await client.query(
      `SELECT m.id, m.nombre, m.especie, m.fecha_nacimiento,
              d.nombre AS dueno, d.telefono
       FROM mascotas m
       JOIN duenos d ON d.id = m.dueno_id
       WHERE m.nombre ILIKE $1
       ORDER BY m.nombre`,
      [`%${nombre}%`]
    );

    await client.query('COMMIT');
    return NextResponse.json({ mascotas: result.rows });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[GET /api/mascotas] Error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  } finally {
    client.release();
  }
}