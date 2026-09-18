CREATE PROCEDURE create_adoption_application(
    IN p_adopter_id BIGINT,
    IN p_pet_id BIGINT
)
BEGIN
    DECLARE v_pet_exists INT DEFAULT 0;
    DECLARE v_pet_status VARCHAR(50);
    DECLARE v_pending_exists INT DEFAULT 0;

    SELECT COUNT(*), MAX(status)
    INTO v_pet_exists, v_pet_status
    FROM pets
    WHERE id = p_pet_id;

    IF v_pet_exists = 0 THEN

        SELECT
            'error' AS result,
            'Pet not found.' AS message;

    ELSEIF v_pet_status <> 'available' THEN

        SELECT
            'error' AS result,
            'This pet is not currently available for adoption.' AS message;

    ELSE

        SELECT COUNT(*)
        INTO v_pending_exists
        FROM applications
        WHERE adopter_id = p_adopter_id
          AND pet_id = p_pet_id
          AND status = 'pending';

        IF v_pending_exists > 0 THEN

            SELECT
                'error' AS result,
                'You already have a pending application for this pet.' AS message;

        ELSE

            INSERT INTO applications (
                adopter_id,
                pet_id,
                status,
                created_at,
                updated_at
            )
            VALUES (
                p_adopter_id,
                p_pet_id,
                'pending',
                NOW(),
                NOW()
            );

            SELECT
                'success' AS result,
                'Application submitted successfully.' AS message,
                LAST_INSERT_ID() AS application_id;

        END IF;

    END IF;

END