<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'adopter_id',
        'pet_id',
        'status',
    ];

    /**
     * Application belongs to one adopter.
     */
    public function adopter(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'adopter_id'
        );
    }

    /**
     * Application belongs to one pet.
     */
    public function pet(): BelongsTo
    {
        return $this->belongsTo(
            Pet::class,
            'pet_id'
        );
    }
}