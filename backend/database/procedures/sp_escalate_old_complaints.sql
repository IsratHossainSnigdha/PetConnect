

CREATE PROCEDURE sp_escalate_old_complaints(
    IN  p_max_days        INT,
    OUT p_checked_count   INT,
    OUT p_escalated_count INT
)
BEGIN
   
    --
    DECLARE v_complaint_id BIGINT;
    DECLARE v_created_at   DATETIME;
    DECLARE v_age_in_days  INT;

    DECLARE v_done INT DEFAULT 0;

    --
    DECLARE cur_pending CURSOR FOR
        SELECT id, created_at
        FROM complaints
        WHERE status = 'Pending'
        ORDER BY created_at ASC;

   
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

   
  
    SET p_checked_count   = 0;
    SET p_escalated_count = 0;

  
    OPEN cur_pending;

  

    escalate_loop: LOOP

       
        FETCH cur_pending INTO v_complaint_id, v_created_at;

        
        IF v_done = 1 THEN
            LEAVE escalate_loop;
        END IF;

        
        SET p_checked_count = p_checked_count + 1;

       
        SET v_age_in_days = DATEDIFF(NOW(), v_created_at);

       
       
        IF v_age_in_days > p_max_days THEN

            UPDATE complaints
            SET status     = 'Escalated',
                updated_at = NOW()
            WHERE id = v_complaint_id
             
              AND status = 'Pending';

            SET p_escalated_count = p_escalated_count + 1;

        END IF;
        
    END LOOP escalate_loop;

    
    CLOSE cur_pending;

END
