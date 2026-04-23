import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getRolePg } from '@/lib/auth';
import type { CitaBody } from '@/types';

export async function POST(req: NextRequest) {
  const rol = req.headers.get('x-rol') ?? '';
  const vetIdRaw = req.headers.get('x-vet-id') ?? '';

  if (!['veterinario', 'recepcionista'].includes(rol)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  let vetIdNum: number | null = null;
  if (rol === 'veterinario') {
    vetIdNum = parseInt(vetIdRaw, 10);
    if (isNaN(vetIdNum) || vetIdNum <= 0 || String(vetIdNum) !== vetIdRaw.trim()) {
      return NextResponse.json({ error: 'x-vet-id inválido' }, { status: 400 });
    }
  }

  let body: CitaBody;
  try {
    body = await req.json() as CitaBody;
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const mascotaId    = Number(body.mascota_id);
  const veterinarioId = Number(body.veterinario_id);
  const motivo       = String(body.motivo ?? '').slice(0, 500);
  const fechaHora    = body.fecha_hora;

  if (!Number.isInteger(mascotaId) || mascotaId <= 0) {
    return NextResponse.json({ error: 'mascota_id inválido' }, { status: 400 });
  }
  if (!Number.isInteger(veterinarioId) || veterinarioId <= 0) {
    return NextResponse.json({ error: 'veterinario_id inválido' }, { status: 400 });
  }
  if (!fechaHora || isNaN(Date.parse(String(fechaHora)))) {
    return NextResponse.json({ error: 'fecha_hora inválida' }, { status: 400 });
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
      `CALL sp_agendar_cita($1, $2, $3, $4, NULL)`,
      [mascotaId, veterinarioId, new Date(String(fechaHora)), motivo]
    );

    await client.query('COMMIT');

    return NextResponse.json(
      { mensaje: 'Cita agendada', cita_id: result.rows[0]?.p_cita_id },
      { status: 201 }
    );

  } catch (err: unknown) {
    await client.query('ROLLBACK');
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[POST /api/citas] Error:', message);
    return NextResponse.json({ error: 'No se pudo agendar la cita' }, { status: 500 });
  } finally {
    client.release();
  }
}