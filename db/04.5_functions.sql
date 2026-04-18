create or replace function fn_total_facturado(
    p_mascota_id INT,
    p_anio INT
)
RETURNS NUMERIC AS $$
DECLARE
    total NUMERIC;
BEGIN
    SELECT COALESCE(SUM(costo), 0) INTO total    
    from citas 
    where mascota_id = p_mascota_id
    and EXTRACT(YEAR FROM fecha_hora) = p_anio
    and estado = 'COMPLETADA';
    RETURN total;

END;
$$ LANGUAGE plpgsql;