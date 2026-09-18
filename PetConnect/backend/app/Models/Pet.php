<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pet extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'breed',
        'age',
        'gender',
        'description',
        'image',
        'status',
        'shelter_id',
    ];

    /**
     * Pet belongs to one shelter.
     */
    public function shelter(): BelongsTo
    {
        return $this->belongsTo(
            Shelter::class,
            'shelter_id'
        );
    }

    /**
     * Pet can have many adoption applications.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(
            Application::class,
            'pet_id'
        );
    }
}