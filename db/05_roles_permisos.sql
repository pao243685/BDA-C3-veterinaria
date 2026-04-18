CREATE ROLE veterinario;
CREATE ROLE recepcionista;
CREATE ROLE admin;

GRANT SELECT ON mascotas TO veterinario;
GRANT SELECT, UPDATE ON citas TO veterinario;
GRANT SELECT, INSERT ON vet_atiende_mascotas TO veterinario;
GRANT SELECT, INSERT ON vacunas_aplicadas TO veterinario;

GRANT SELECT ON mascotas TO recepcionista;
GRANT SELECT ON duenos TO recepcionista;
GRANT SELECT, INSERT ON citas TO recepcionista;
GRANT SELECT ON veterinarios TO recepcionista;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO admin;

GRANT USAGE ON SCHEMA public TO veterinario;
GRANT USAGE ON SCHEMA public TO recepcionista;
GRANT USAGE ON SCHEMA public TO admin;