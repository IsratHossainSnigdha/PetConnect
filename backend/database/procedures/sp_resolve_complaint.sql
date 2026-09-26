CREATE PROCEDURE sp_resolve_complaint(
    IN  p_complaint_id BIGINT,
    IN  p_admin_id     BIGINT,
    OUT p_status       VARCHAR(20),
    OUT p_message      VARCHAR(255)
)
BEGIN
    DECLARE v_complaint_exists INT DEFAULT 0;
    DECLARE v_current_status   VARCHAR(20);
    DECLARE v_subject          VARCHAR(255);
    DECLARE v_admin_exists     INT DEFAULT 0;

    -- ------------------------------------------------------------------------
    -- THE SAFETY NET
    -- ------------------------------------------------------------------------
    --
    -- If ANY statement inside this procedure raises an error - a broken foreign
    -- key, a missing table, a disk problem - MySQL jumps straight here.
    --
    -- EXIT means the procedure stops at this point, so nothing after the
    -- failure runs. The ROLLBACK undoes every change made since START
    -- TRANSACTION, which is what guarantees we never leave a complaint marked
    -- resolved with no matching audit row, or the other way round.
    --
    -- Without this handler a failure halfway through would leave the
    -- transaction open and the earlier writes still pending.
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
    SELECT COUNT(*), MAX(status), MAX(subject)
    INTO v_complaint_exists, v_current_status, v_subject
    FROM complaints
    WHERE id = p_complaint_id;

    SELECT COUNT(*)
    INTO v_admin_exists
    FROM users
    WHERE id = p_admin_id
      AND role = 'platform_admin';

    IF v_complaint_exists = 0 THEN

        SET p_status  = 'error';
        SET p_message = 'Complaint not found.';

    ELSEIF v_admin_exists = 0 THEN

        -- complaints.resolved_by is a foreign key to users, so a bad id would
        -- be rejected anyway - but as a raw constraint error. Checking here
        -- turns that into a sentence the admin page can display.
        SET p_status  = 'error';
        SET p_message = 'The resolving admin was not found.';

    ELSEIF v_current_status = 'Resolved' THEN

        SET p_status  = 'error';
        SET p_message = 'This complaint is already resolved.';

    ELSE

        -- --------------------------------------------------------------------
        -- 2. THE TRANSACTION
        -- --------------------------------------------------------------------
        --
        -- Two writes to two different tables have to happen together:
        --
        --     UPDATE complaints          - close the complaint
        --     INSERT INTO admin_activities - record who closed it
        --
        -- Run separately, a crash between them leaves the database lying: a
        -- complaint that looks resolved with nothing saying who did it, or an
        -- audit row for something that never happened.
        --
        -- START TRANSACTION makes them one indivisible step. Nothing written
        -- between here and COMMIT is visible to any other connection, and if
        -- anything goes wrong it all disappears. That is ATOMICITY - the A in
        -- ACID.
        --
        START TRANSACTION;

        UPDATE complaints
        SET status      = 'Resolved',
            resolved_by = p_admin_id,
            resolved_at = NOW(),
            updated_at  = NOW()
        WHERE id = p_complaint_id
          -- Re-check the status inside the UPDATE. Between the SELECT above
          -- and this line another admin could have resolved it, and without
          -- this we would overwrite their resolved_by with ours.
          AND status <> 'Resolved';

        -- ROW_COUNT() is how many rows the UPDATE just changed. Zero means the
        -- race above actually happened.
        IF ROW_COUNT() = 0 THEN

            -- Give up cleanly. No audit row is written for a resolve that did
            -- not happen.
            ROLLBACK;

            SET p_status  = 'error';
            SET p_message = 'This complaint was resolved by someone else.';

        ELSE

            -- Second write. If THIS fails, the EXIT HANDLER above rolls the
            -- UPDATE back too - neither survives alone.
            INSERT INTO admin_activities (
                admin_id,
                complaint_id,
                action,
                details,
                created_at,
                updated_at
            )
            VALUES (
                p_admin_id,
                p_complaint_id,
                'complaint_resolved',
                CONCAT(
                    'Changed complaint #', p_complaint_id,
                    ' ("', v_subject, '") from ', v_current_status,
                    ' to Resolved.'
                ),
                NOW(),
                NOW()
            );

            -- Both writes succeeded. COMMIT makes them permanent and visible
            -- to everyone else. Before this line no other connection could see
            -- either one.
            COMMIT;

            SET p_status  = 'success';
            SET p_message = 'Complaint resolved.';

        END IF;

    END IF;

END
