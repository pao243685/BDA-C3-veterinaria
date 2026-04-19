
ALTER TABLE mascotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacunas_aplicadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;


CREATE POLICY vet_ve_sus_mascotas
ON mascotas
FOR SELECT
TO veterinario
USING (
    id IN (
        SELECT mascota_id
        FROM vet_atiende_mascota
        WHERE vet_id = current_setting('app.current_vet_id', true)::INT
          AND activa = TRUE
    )
);


CREATE POLICY recepcion_ve_mascotas
ON mascotas
FOR SELECT
TO recepcionista
USING (true);

CREATE POLICY admin_ve_mascotas
ON mascotas
FOR ALL
TO admin
USING (true);

CREATE POLICY vet_ve_sus_vacunas
ON vacunas_aplicadas
FOR SELECT
TO veterinario
USING (
    mascota_id IN (
        SELECT mascota_id
        FROM vet_atiende_mascota
        WHERE vet_id = current_setting('app.current_vet_id', true)::INT
          AND activa = TRUE
    )
);

CREATE POLICY vet_inserta_vacunas
ON vacunas_aplicadas
FOR INSERT
TO veterinario
WITH CHECK (
    mascota_id IN (
        SELECT mascota_id
        FROM vet_atiende_mascota
        WHERE vet_id = current_setting('app.current_vet_id', true)::INT
          AND activa = TRUE
    )
);

CREATE POLICY admin_ve_vacunas
ON vacunas_aplicadas
FOR ALL
TO admin
USING (true);


CREATE POLICY vet_ve_sus_citas
ON citas
FOR SELECT
TO veterinario
USING (
    veterinario_id = current_setting('app.current_vet_id', true)::INT
);

CREATE POLICY vet_inserta_citas
ON citas
FOR INSERT
TO veterinario
WITH CHECK (
    veterinario_id = current_setting('app.current_vet_id', true)::INT
);


CREATE POLICY recepcion_ve_citas
ON citas
FOR SELECT
TO recepcionista
USING (true);

CREATE POLICY recepcion_inserta_citas
ON citas
FOR INSERT
TO recepcionista
WITH CHECK (true);


CREATE POLICY admin_ve_citas
ON citas
FOR ALL
TO admin
USING (true);