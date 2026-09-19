
DROP PROCEDURE IF EXISTS sp_add_shelter_pet;

DELIMITER //

CREATE PROCEDURE sp_add_shelter_pet(
    IN p_name VARCHAR(255),
    IN p_type VARCHAR(255),
    IN p_breed VARCHAR(255),
    IN p_age VARCHAR(255),
    IN p_status VARCHAR(255),
    IN p_image TEXT,
    IN p_shelter_id BIGINT
)
BEGIN
    INSERT INTO pets (name, type, breed, age, status, image, shelter_id, created_at, updated_at)
    VALUES (p_name, p_type, p_breed, p_age, p_status, p_image, p_shelter_id, NOW(), NOW());
END //

DELIMITER ;