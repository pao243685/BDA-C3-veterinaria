CREATE USER veterinaria WITH PASSWORD 'veterinari@2026';
GRANT CONNECT ON DATABASE clinica_vet TO veterinaria;
GRANT USAGE ON SCHEMA public TO veterinaria;

CREATE ROLE veterinario;
CREATE ROLE recepcionista;
CREATE ROLE admin;

GRANT USAGE ON SCHEMA public TO veterinario;
GRANT SELECT ON mascotas TO veterinario;
GRANT SELECT ON duenos TO veterinario;
GRANT SELECT ON vet_atiende_mascota TO veterinario;
GRANT SELECT ON inventario_vacunas TO veterinario;
GRANT SELECT, INSERT ON citas TO veterinario;
GRANT SELECT, INSERT ON vacunas_aplicadas TO veterinario;
GRANT INSERT ON historial_movimientos TO veterinario;
GRANT USAGE, SELECT ON SEQUENCE citas_id_seq TO veterinario;
GRANT USAGE, SELECT ON SEQUENCE vacunas_aplicadas_id_seq TO veterinario;
GRANT USAGE, SELECT ON SEQUENCE historial_movimientos_id_seq TO veterinario;
GRANT EXECUTE ON PROCEDURE sp_agendar_cita(INT, INT, TIMESTAMP, TEXT, INT) TO veterinario;

GRANT USAGE ON SCHEMA public TO recepcionista;
GRANT SELECT ON mascotas TO recepcionista;
GRANT SELECT ON duenos TO recepcionista;
GRANT SELECT ON veterinarios TO recepcionista;
GRANT SELECT, INSERT ON citas TO recepcionista;
GRANT INSERT ON historial_movimientos TO recepcionista;
GRANT SELECT ON v_mascotas_vacunacion_pendiente TO recepcionista;
GRANT USAGE, SELECT ON SEQUENCE citas_id_seq TO recepcionista;
GRANT USAGE, SELECT ON SEQUENCE historial_movimientos_id_seq TO recepcionista;

GRANT USAGE ON SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
GRANT SELECT ON v_mascotas_vacunacion_pendiente TO admin;

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE INSERT, UPDATE, DELETE ON mascotas FROM veterinario;
REVOKE INSERT, UPDATE, DELETE ON duenos FROM veterinario;
REVOKE ALL ON vacunas_aplicadas FROM recepcionista;
REVOKE ALL ON inventario_vacunas FROM recepcionista;

GRANT veterinario TO veterinaria;
GRANT recepcionista TO veterinaria;
GRANT admin TO veterinaria;