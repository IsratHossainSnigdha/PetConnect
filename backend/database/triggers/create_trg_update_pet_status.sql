
DROP TRIGGER IF EXISTS trg_update_pet_status_on_adoption;

DELIMITER //

CREATE TRIGGER trg_update_pet_status_on_adoption
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    
    IF NEW.status = 'accepted' AND OLD.status <> 'accepted' THEN
        -- Update the associated pet's status to 'adopted'
        UPDATE pets 
        SET status = 'adopted', updated_at = NOW() 
        WHERE id = NEW.pet_id;
    END IF;
END //

DELIMITER ;