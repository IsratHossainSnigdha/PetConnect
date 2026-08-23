<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/*
|--------------------------------------------------------------------------
| MODEL: Shelter
|--------------------------------------------------------------------------
|
| A Model is the PHP face of ONE database table. Laravel uses a pattern called
| Active Record: the class name is singular ("Shelter"), and Laravel assumes
| the table is the plural snake_case version ("shelters"). One OBJECT of this
| class == one ROW of that table.
|
| This is what lets you write
|       Shelter::find(3)->name
| instead of
|       SELECT name FROM shelters WHERE id = 3 LIMIT 1;
|
| The SQL still runs - Eloquent just writes it for you.
|
*/
#[Fillable([
    'name',
    'location',
    'contact_email',
    'contact_phone',
    'status',
])]
class Shelter extends Model
{
    use HasFactory;

    /*
    |----------------------------------------------------------------------
    | WHY #[Fillable] EXISTS: mass-assignment protection
    |----------------------------------------------------------------------
    |
    | Shelter::create($request->all()) would blindly copy every field the
    | browser sent into the INSERT. If an attacker added "id": 1 or a column
    | you never intended to expose, it would be written straight to the table.
    |
    | The fillable list is an allow-list: ONLY these five columns may be filled
    | from user input. Anything else is silently ignored. Note that `id`,
    | `created_at` and `updated_at` are deliberately absent - the database and
    | Laravel own those, not the user.
    */

    /**
     * RELATIONSHIP: one shelter HAS MANY staff users.
     *
     * This is the mirror image of the belongsTo() on the User model. Both
     * sides describe the SAME foreign key (users.shelter_id) - you just read
     * it from different directions.
     *
     * Calling $shelter->staff() runs:
     *     SELECT * FROM users WHERE shelter_id = <this shelter's id>;
     *
     * Because we count staff in the admin dashboard, we usually do NOT load
     * the full list. Instead the controller uses withCount('staff'), which
     * asks MySQL to do the counting:
     *     SELECT shelters.*, (SELECT COUNT(*) FROM users
     *                         WHERE users.shelter_id = shelters.id) AS staff_count
     *     FROM shelters;
     * Counting in SQL is far cheaper than pulling every staff row into PHP
     * just to call count() on the array.
     */
    public function staff(): HasMany
    {
        // Arguments: the related model, then the foreign key column that
        // lives on the OTHER table (users.shelter_id).
        return $this->hasMany(User::class, 'shelter_id');
    }

    public function pets(): HasMany
{
    return $this->hasMany(
        Pet::class,
        'shelter_id'
    );
}
}
