CREATE USER veterinaria WITH PASSWORD 'veterinari@2026';
GRANT CONNECT ON DATABASE clinica_vet TO veterinaria;
GRANT USAGE ON SCHEMA public TO veterinaria;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO veterinaria;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO veterinaria;

CREATE ROLE veterinario;
CREATE ROLE recepcionista;
CREATE ROLE admin;

GRANT SELECT ON mascotas TO veterinario;
GRANT SELECT, UPDATE ON citas TO veterinario;
GRANT SELECT, INSERT ON vet_atiende_mascota TO veterinario;
GRANT SELECT, INSERT ON vacunas_aplicadas TO veterinario;
GRANT SELECT ON duenos TO veterinario;
GRANT EXECUTE ON PROCEDURE sp_agendar_cita(INT, INT, TIMESTAMP, TEXT, INT) TO veterinario;

GRANT SELECT ON mascotas TO recepcionista;
GRANT SELECT ON duenos TO recepcionista;
GRANT SELECT, INSERT ON citas TO recepcionista;
GRANT SELECT ON veterinarios TO recepcionista;
GRANT USAGE, SELECT ON SEQUENCE vacunas_aplicadas_id_seq TO veterinario;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO admin;

GRANT USAGE ON SCHEMA public TO veterinario;
GRANT USAGE ON SCHEMA public TO recepcionista;
GRANT USAGE ON SCHEMA public TO admin;



GRANT veterinario TO veterinaria;
GRANT recepcionista TO veterinaria;
GRANT admin TO veterinaria;