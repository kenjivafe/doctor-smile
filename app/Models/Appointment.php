<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'patient_id',
        'dentist_id',
        'dental_service_id',
        'appointment_datetime',
        'duration_minutes',
        'status',
        'notes',
        'treatment_notes',
        'cost',
        'cancellation_reason',
        'is_paid',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'appointment_datetime' => 'datetime',
        'cost' => 'decimal:2',
        'duration_minutes' => 'integer',
        'is_paid' => 'boolean',
    ];

    /**
     * Get the patient that owns the appointment.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the dentist associated with the appointment.
     */
    public function dentist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dentist_id');
    }

    /**
     * Get the dental service associated with the appointment.
     */
    public function dentalService(): BelongsTo
    {
        return $this->belongsTo(DentalService::class);
    }
}
