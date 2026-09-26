CREATE TRIGGER trg_log_user_settings_change
AFTER UPDATE ON user_settings
FOR EACH ROW
BEGIN

    -- OLD is the row before the update, NEW is the row after it.
    --
    -- Every setting gets its own IF, and each one compares the two. That is
    -- what makes this a CHANGE log rather than a save log: saving the page
    -- without touching anything writes nothing at all, and flipping one toggle
    -- writes exactly one row naming that toggle.
    --
    -- A single "settings were saved" row would be far less useful - it could
    -- not answer "when was this switched off, and what was it before?"

    IF NEW.email_notifications <> OLD.email_notifications THEN
        INSERT INTO user_settings_history
            (user_id, setting_name, old_value, new_value, changed_at)
        VALUES (
            NEW.user_id,
            'email_notifications',
            -- The column is a BOOLEAN, which MySQL stores as 1 and 0. Writing
            -- 'on'/'off' keeps the history readable without the reader having
            -- to know that.
            IF(OLD.email_notifications, 'on', 'off'),
            IF(NEW.email_notifications, 'on', 'off'),
            NOW()
        );
    END IF;

    IF NEW.adoption_alerts <> OLD.adoption_alerts THEN
        INSERT INTO user_settings_history
            (user_id, setting_name, old_value, new_value, changed_at)
        VALUES (
            NEW.user_id,
            'adoption_alerts',
            IF(OLD.adoption_alerts, 'on', 'off'),
            IF(NEW.adoption_alerts, 'on', 'off'),
            NOW()
        );
    END IF;

    IF NEW.public_profile <> OLD.public_profile THEN
        INSERT INTO user_settings_history
            (user_id, setting_name, old_value, new_value, changed_at)
        VALUES (
            NEW.user_id,
            'public_profile',
            IF(OLD.public_profile, 'on', 'off'),
            IF(NEW.public_profile, 'on', 'off'),
            NOW()
        );
    END IF;

    IF NEW.dark_mode <> OLD.dark_mode THEN
        INSERT INTO user_settings_history
            (user_id, setting_name, old_value, new_value, changed_at)
        VALUES (
            NEW.user_id,
            'dark_mode',
            IF(OLD.dark_mode, 'on', 'off'),
            IF(NEW.dark_mode, 'on', 'off'),
            NOW()
        );
    END IF;

    -- language is a string, so it is written through as-is rather than
    -- translated to on/off.
    IF NEW.language <> OLD.language THEN
        INSERT INTO user_settings_history
            (user_id, setting_name, old_value, new_value, changed_at)
        VALUES (
            NEW.user_id,
            'language',
            OLD.language,
            NEW.language,
            NOW()
        );
    END IF;

END
