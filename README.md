This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
docker compose up --build
```

# Clínica Veterinaria — Corte 3 BDA
Sistema full-stack con seguridad de base de datos.  
Stack: PostgreSQL 15 · Redis 7 · Next.js 15 · TypeScript · Docker

---

## 1. Política RLS en la tabla `mascotas`

```sql
CREATE POLICY vet_ve_sus_mascotas
ON mascotas FOR SELECT TO veterinario
USING (
    id IN (
        SELECT mascota_id FROM vet_atiende_mascota
        WHERE vet_id = current_setting('app.current_vet_id', true)::INT
          AND activa = TRUE
    )
);
```

Cuando el rol `veterinario` ejecuta `SELECT` sobre `mascotas`, Postgres 
evalúa esta condición por cada fila. Solo pasan las filas cuyo `id` aparece 
en `vet_atiende_mascota` para el veterinario activo. El veterinario activo 
se identifica con `current_setting('app.current_vet_id')`, que el backend 
setea al inicio de cada transacción con `SET LOCAL app.current_vet_id = X`.

---

## 2. Vector de ataque del mecanismo de identidad y cómo se previene

El mecanismo usa `SET LOCAL app.current_vet_id`. El vector de ataque es que 
alguien con acceso directo a la conexión de BD ejecute ese SET antes de su 
query y suplante a otro veterinario.

Mi sistema lo previene porque **ningún cliente se conecta directamente a 
PostgreSQL**. Solo el backend (Next.js API routes) tiene credenciales de BD. 
El `vetId` que el frontend manda viaja en un header HTTP (`x-vet-id`), y el 
backend lo setea internamente — el cliente nunca ejecuta SQL directamente.

---

## 3. SECURITY DEFINER

No uso `SECURITY DEFINER` en ningún procedure. No fue necesario porque los 
roles tienen los permisos mínimos necesarios directamente sobre las tablas, 
y RLS se encarga del filtrado por fila. Usar `SECURITY DEFINER` habría 
introducido el riesgo de escalada de privilegios por manipulación del 
`search_path` sin ningún beneficio para este sistema.

---

## 4. TTL del caché Redis

TTL: **300 segundos (5 minutos)**.

La vista `v_mascotas_vacunacion_pendiente` recorre todas las mascotas y 
vacunas — es la query más costosa del sistema. Los datos cambian únicamente 
cuando se aplica una vacuna nueva.

- **Demasiado bajo (ej: 10s):** casi cada consulta iría a la BD, 
  el caché no aportaría nada.  
- **Demasiado alto (ej: 1h):** si se vacuna a una mascota, seguiría 
  apareciendo como pendiente durante una hora.  
- **5 minutos:** balance razonable — frescura aceptable + alivio real 
  a la BD. Además se invalida explícitamente al aplicar una vacuna, 
  así que el peor caso es 5 minutos de dato viejo solo si alguien 
  vacunó y nadie invalidó (lo cual no ocurre en este sistema).

---

## 5. Endpoint crítico y línea de hardening

Endpoint: `GET /api/mascotas`  
Archivo: `src/app/api/mascotas/route.ts`

```typescript
const result = await client.query(
  `SELECT m.id, m.nombre, m.especie, m.fecha_nacimiento,
          d.nombre AS dueno, d.telefono
   FROM mascotas m
   JOIN duenos d ON d.id = m.dueno_id
   WHERE m.nombre ILIKE $1
   ORDER BY m.nombre`,
  [`%${nombre}%`] 
);
```

El `$1` es un parámetro vinculado. El driver `pg` lo envía como dato 
binario separado del SQL — Postgres nunca lo parsea como código. 
Si el usuario mete `' OR '1'='1`, Postgres lo busca literalmente 
como texto contra el campo `nombre`. Protege contra quote-escape, 
stacked queries, y union-based injection.

---

## 6. Si se revocan todos los permisos del veterinario excepto SELECT en mascotas

Tres operaciones que se romperían:

1. **Registrar vacunas** — el veterinario necesita `INSERT` en 
   `vacunas_aplicadas`. Sin ese permiso, `POST /api/vacunas` falla 
   con error de permisos en la BD.

2. **Agendar citas** — necesita `INSERT` y `UPDATE` en `citas`. 
   Sin esos permisos, `POST /api/citas` y cualquier actualización 
   de estado fallarían.

3. **Ejecutar el procedure `sp_agendar_cita`** — necesita `EXECUTE` 
   sobre el procedure. Sin ese permiso, el `CALL sp_agendar_cita(...)` 
   devuelve error aunque tenga SELECT en mascotas.