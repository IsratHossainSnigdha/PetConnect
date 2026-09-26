CREATE TRIGGER trg_notify_user_on_complaint_resolved
AFTER UPDATE ON complaints
FOR EACH ROW
BEGIN

    -- OLD = the row before the UPDATE, NEW = the row after it.
    -- Comparing the two is how a trigger detects a CHANGE rather than just a
    -- value. Checking only NEW.status = 'Resolved' would fire again every time
    -- an already-resolved complaint was edited for any reason, which is the
    -- "unnecessary notification" the task warns about.
    IF NEW.status = 'Resolved' AND OLD.status <> 'Resolved' THEN

        INSERT INTO notifications (
            user_id,
            title,
            message,
            is_read,
            created_at,
            updated_at
        )
        VALUES (
            -- The complaint owner, straight off the row being updated. No JOIN
            -- needed: complaints.user_id is already the person to notify.
            NEW.user_id,

            'Complaint Resolved',

            CONCAT(
                'Your complaint #', NEW.id,
                ' ("', NEW.subject, '") has been resolved',
                -- resolved_at can still be NULL, so IF() keeps the sentence
                -- readable instead of producing "resolved on NULL". CONCAT
                -- returns NULL if ANY argument is NULL, which would blank the
                -- whole message.
                IF(
                    NEW.resolved_at IS NULL,
                    '',
                    CONCAT(' on ', DATE_FORMAT(NEW.resolved_at, '%d %b %Y at %H:%i'))
                ),
                '.'
            ),

            0,
            NOW(),
            NOW()
        );

    END IF;

END
