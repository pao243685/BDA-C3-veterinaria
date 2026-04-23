import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import redis from '@/lib/redis';
import { getRolePg } from '@/lib/auth';
import type { VacunaBody } from '@/types';

const CACHE_KEY = 'vacunacion_pendiente';

export async function POST(req: NextRequest) {
  const rol      = req.headers.get('x-rol') ?? '';
  const vetIdRaw = req.headers.get('x-vet-id') ?? '';

  if (rol !== 'veterinario') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const vetIdNum = parseInt(vetIdRaw, 10);
  if (isNaN(vetIdNum) || vetIdNum <= 0 || String(vetIdNum) !== vetIdRaw.trim()) {
    return NextResponse.json({ error: 'x-vet-id inválido' }, { status: 400 });
  }

  let body: VacunaBody;
  try {
    body = await req.json() as VacunaBody;
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const mascotaId     = Number(body.mascota_id);
  const vacunaId      = Number(body.vacuna_id);
  const veterinarioId = Number(body.veterinario_id);
  const costoCobrado  = Number(body.costo_cobrado ?? 0);

  if (!Number.isInteger(mascotaId) || mascotaId <= 0) {
    return NextResponse.json({ error: 'mascota_id inválido' }, { status: 400 });
  }
  if (!Number.isInteger(vacunaId) || vacunaId <= 0) {
    return NextResponse.json({ error: 'vacuna_id inválido' }, { status: 400 });
  }
  if (!Number.isInteger(veterinarioId) || veterinarioId <= 0) {
    return NextResponse.json({ error: 'veterinario_id inválido' }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL ROLE ${getRolePg(rol)}`);

    await client.query('SELECT set_config($1, $2, true)', [
      'app.current_vet_id',
      String(vetIdNum),
    ]);

    await client.query(
      `INSERT INTO vacunas_aplicadas
         (mascota_id, vacuna_id, veterinario_id, fecha_aplicacion, costo_cobrado)
       VALUES ($1, $2, $3, CURRENT_DATE, $4)`,
      [mascotaId, vacunaId, veterinarioId, costoCobrado]
    );

    await client.query('COMMIT');

    await redis.del(CACHE_KEY);
    console.log('[CACHE INVALIDADO] vacunacion_pendiente');

    return NextResponse.json(
      { mensaje: 'Vacuna aplicada correctamente' },
      { status: 201 }
    );

  } catch (err: unknown) {
    await client.query('ROLLBACK');
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[POST /api/vacunas] Error:', message);
    return NextResponse.json(
      { error: 'No se pudo registrar la vacuna' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
