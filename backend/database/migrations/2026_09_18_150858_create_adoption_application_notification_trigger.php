<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared('
            CREATE TRIGGER notify_shelter_staff_after_application
            AFTER INSERT ON applications
            FOR EACH ROW
            BEGIN

                INSERT INTO notifications (
                    user_id,
                    title,
                    message,
                    created_at,
                    updated_at
                )
                SELECT
                    users.id,
                    "New Adoption Application",
                    CONCAT(
                        "A new adoption application was submitted for ",
                        pets.name,
                        "."
                    ),
                    NOW(),
                    NOW()
                FROM pets
                INNER JOIN users
                    ON users.shelter_id = pets.shelter_id
                WHERE pets.id = NEW.pet_id
                  AND users.role = "shelter_staff";

            END
        ');
    }

    public function down(): void
    {
        DB::unprepared('
            DROP TRIGGER IF EXISTS notify_shelter_staff_after_application
        ');
    }
};