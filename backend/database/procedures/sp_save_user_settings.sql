CREATE PROCEDURE sp_save_user_settings(
    IN  p_user_id             BIGINT,
    IN  p_email_notifications TINYINT,
    IN  p_adoption_alerts     TINYINT,
    IN  p_public_profile      TINYINT,
    IN  p_dark_mode           TINYINT,
    IN  p_language            VARCHAR(50),
    OUT p_status              VARCHAR(20),
    OUT p_message             VARCHAR(255)
)
BEGIN
    DECLARE v_user_exists INT DEFAULT 0;
    DECLARE v_has_row     INT DEFAULT 0;

    -- ------------------------------------------------------------------------
    -- THE SAFETY NET
    -- ------------------------------------------------------------------------
    --
    -- If any statement below raises an error, MySQL jumps here. EXIT stops the
    -- procedure, and the ROLLBACK undoes everything since START TRANSACTION -
    -- including any history rows the trigger already wrote.
    --
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status  = 'error';
        SET p_message = 'A database error occurred. Nothing was saved.';
    END;

    -- ------------------------------------------------------------------------
    -- 1. CHECKS  (read-only, so no transaction needed yet)
    -- ------------------------------------------------------------------------
    SELECT COUNT(*) INTO v_user_exists FROM users WHERE id = p_user_id;

    IF v_user_exists = 0 THEN

        SET p_status  = 'error';
        SET p_message = 'User not found.';

    ELSEIF p_language NOT IN ('English', 'Bangla') THEN

        -- The allowed list lives here rather than only in PHP, so the rule
        -- holds no matter who is writing. A plain VARCHAR column would
        -- otherwise accept any string at all.
        SET p_status  = 'error';
        SET p_message = 'Language must be English or Bangla.';

    ELSE

        START TRANSACTION;

        -- Is this the user's first save, or are they changing existing
        -- settings? The two cases need different statements, and the answer
        -- also decides whether the trigger fires at all.
        SELECT COUNT(*) INTO v_has_row
        FROM user_settings
        WHERE user_id = p_user_id;

        IF v_has_row = 0 THEN

            -- First save. There is no previous value for anything, so there is
            -- nothing to log - and correctly, an INSERT does not fire the
            -- AFTER UPDATE trigger.
            INSERT INTO user_settings (
                user_id,
                email_notifications,
                adoption_alerts,
                public_profile,
                dark_mode,
                language,
                created_at,
                updated_at
            )
            VALUES (
                p_user_id,
                p_email_notifications,
                p_adoption_alerts,
                p_public_profile,
                p_dark_mode,
                p_language,
                NOW(),
                NOW()
            );

            SET p_message = 'Settings created.';

        ELSE

            -- Changing existing settings. This UPDATE is what fires
            -- trg_log_user_settings_change, which writes one history row per
            -- field that actually changed. Saving without changing anything
            -- writes no history at all.
            UPDATE user_settings
            SET email_notifications = p_email_notifications,
                adoption_alerts     = p_adoption_alerts,
                public_profile      = p_public_profile,
                dark_mode           = p_dark_mode,
                language            = p_language,
                updated_at          = NOW()
            WHERE user_id = p_user_id;

            SET p_message = 'Settings updated.';

        END IF;

        -- Both the settings row and whatever history the trigger wrote become
        -- permanent together. Until this line neither is visible to anyone
        -- else, and a failure would have taken both.
        COMMIT;

        SET p_status = 'success';

    END IF;

END
