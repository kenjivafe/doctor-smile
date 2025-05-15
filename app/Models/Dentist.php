<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dentist extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'contact_number',
        'address',
        'bio',
        'years_of_experience',
    ];

    /**
     * Get the user that owns the dentist profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }



    /**
     * Get the appointments for the dentist.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}
