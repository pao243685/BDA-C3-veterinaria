import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getRolePg } from '@/lib/auth';  

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nombre = searchParams.get('nombre') ?? '';
  const rol = req.headers.get('x-rol') ?? '';
  const vetId = req.headers.get('x-vet-id') ?? '';

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL ROLE ${getRolePg(rol)}`); 

    if (rol === 'veterinario' && vetId) {
      await client.query(`SET LOCAL app.current_vet_id = '${vetId}'`);
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
