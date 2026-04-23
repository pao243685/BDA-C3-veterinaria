import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import redis from '@/lib/redis';
import { getRolePg } from '@/lib/auth';

const CACHE_KEY = 'vacunacion_pendiente';
const CACHE_TTL = 300; 

export async function GET(req: NextRequest) {
  const rol = req.headers.get('x-rol') ?? '';

  if (!['recepcionista', 'admin'].includes(rol)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const cached = await redis.get(CACHE_KEY);

    if (cached) {
      console.log('[CACHE HIT] vacunacion_pendiente');
      return NextResponse.json({
        mascotas: JSON.parse(cached),
        fuente: 'cache',
      });
    }

    console.log('[CACHE MISS] vacunacion_pendiente — consultando BD');
    const inicio = Date.now();

    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL ROLE ${getRolePg(rol)}`);

      const result = await client.query(
        `SELECT * FROM v_mascotas_vacunacion_pendiente ORDER BY nombre`
      );

      await client.query('COMMIT');

      const ms = Date.now() - inicio;
      console.log(`[BD] vacunacion_pendiente completada en ${ms}ms`);

      await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(result.rows));

      return NextResponse.json({
        mascotas: result.rows,
        fuente: 'base_de_datos',
      });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error('[GET /api/vacunacion-pendiente] Error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}