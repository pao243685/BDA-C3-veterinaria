CREATE OR REPLACE PROCEDURE sp_agendar_cita(
    p_mascota_id INT,
    p_veterinario_id INT,
    p_fecha_hora TIMESTAMP,
    p_motivo TEXT,
    OUT p_cita_id INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO citas(mascota_id, veterinario_id, fecha_hora, motivo)
    VALUES (p_mascota_id, p_veterinario_id, p_fecha_hora, p_motivo)
    RETURNING id INTO p_cita_id;
END;
$$;

