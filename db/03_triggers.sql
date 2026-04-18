CREATE OR REPLACE FUNCTION fn_historial_citas()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO historial_movimientos(tipo,referencia_id,descripcion)
    values ('CITA', NEW.id, 'Cita agendada');
    RETURN NEW;
end;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_historial_citas
AFTER INSERT ON citas
FOR EACH ROW
EXECUTE FUNCTION fn_historial_citas();