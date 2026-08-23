<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'name',
    'username',
    'email',
    'password',
    'password_changed_at',
    'phone',
    'address',
    'role',
    'shelter_name',
    'shelter_contact',
    'shelter_id',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /*
    | HasApiTokens is what gives this model ->createToken() and
    | ->currentAccessToken(). It wires the User model up to the
    | `personal_access_tokens` table, which stores one row per issued
    | API token (its `tokenable_id` column points back at users.id -
    | another one-to-many foreign key relationship).
    */
    use HasApiTokens, HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            // Casting to 'datetime' hands PHP a Carbon date object instead of a
            // raw string, and serialises it to ISO-8601 in JSON so the browser's
            // new Date(...) can parse it.
            'password_changed_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * RELATIONSHIP: this user BELONGS TO one shelter.
     *
     * belongsTo() is used on the side that physically HOLDS the foreign key.
     * users.shelter_id points at shelters.id, so the belongsTo lives here and
     * the matching hasMany lives on Shelter::staff().
     *
     * $user->shelter runs:
     *     SELECT * FROM shelters WHERE id = <this user's shelter_id> LIMIT 1;
     *
     * It returns NULL for adopters and platform admins, because their
     * shelter_id column is NULL - they belong to no shelter.
     */
    public function shelter(): BelongsTo
    {
        return $this->belongsTo(Shelter::class, 'shelter_id');
    }

    /**
 * Adoption applications submitted by this user.
 */
public function applications(): HasMany
{
    return $this->hasMany(
        Application::class,
        'adopter_id'
    );
}
}