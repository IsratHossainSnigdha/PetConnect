CREATE PROCEDURE sp_resolve_complaint(
    IN  p_complaint_id BIGINT,
    IN  p_admin_id     BIGINT,
    OUT p_status       VARCHAR(20),
    OUT p_message      VARCHAR(255)
)
BEGIN
    DECLARE v_complaint_exists INT DEFAULT 0;
    DECLARE v_current_status   VARCHAR(20);
    DECLARE v_admin_exists     INT DEFAULT 0;

    -- One SELECT answers two questions: does the complaint exist, and what is
    -- its status. COUNT(*) is 0 when there is no such row, and MAX(status) is
    -- NULL in that case rather than raising an error.
    SELECT COUNT(*), MAX(status)
    INTO v_complaint_exists, v_current_status
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
        -- race above actually happened, so we report it instead of claiming a
        -- success that did not occur.
        IF ROW_COUNT() = 0 THEN
            SET p_status  = 'error';
            SET p_message = 'This complaint was resolved by someone else.';
        ELSE
            SET p_status  = 'success';
            SET p_message = 'Complaint resolved.';
        END IF;

    END IF;

END
