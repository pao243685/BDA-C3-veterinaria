CREATE OR REPLACE VIEW v_mascotas_vacunacion_pendiente AS
SELECT m.id, m.nombre
FROM mascotas m
LEFT JOIN vacunas_aplicadas v
ON m.id = v.mascota_id
WHERE v.id IS NULL;