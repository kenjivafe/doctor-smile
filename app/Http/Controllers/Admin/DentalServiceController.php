<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DentalService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DentalServiceController extends Controller
{
    /**
     * Display a listing of dental services.
     */
    public function index()
    {
        $services = DentalService::orderBy('name')->get();
        
        return Inertia::render('Admin/dental-services', [
            'services' => $services
        ]);
    }

    /**
     * Show the form for creating a new dental service.
     */
    public function create()
    {
        return Inertia::render('Admin/dental-service-create');
    }

    /**
     * Store a newly created dental service in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:5',
            'category' => ['required', Rule::in(['general', 'cosmetic', 'orthodontic', 'surgical', 'pediatric', 'preventive'])],
            'is_active' => 'boolean',
        ]);

        DentalService::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'duration_minutes' => $validated['duration_minutes'],
            'category' => $validated['category'],
            'is_active' => $validated['is_active'] ?? true,
            'image_path' => null,
        ]);

        return redirect()->route('admin.dental-services')->with('success', 'Dental service created successfully');
    }

    /**
     * Show the form for editing the specified dental service.
     */
    public function edit($id)
    {
        $service = DentalService::findOrFail($id);
        
        return Inertia::render('Admin/dental-service-edit', [
            'service' => $service
        ]);
    }

    /**
     * Update the specified dental service in storage.
     */
    public function update(Request $request, $id)
    {
        $service = DentalService::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:5',
            'category' => ['required', Rule::in(['general', 'cosmetic', 'orthodontic', 'surgical', 'pediatric', 'preventive'])],
            'is_active' => 'boolean',
        ]);

        $service->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'duration_minutes' => $validated['duration_minutes'],
            'category' => $validated['category'],
            'is_active' => $validated['is_active'] ?? true,
            'image_path' => null,
        ]);

        return redirect()->route('admin.dental-services')->with('success', 'Dental service updated successfully');
    }

    /**
     * Remove the specified dental service from storage.
     * This will also delete all associated appointments.
     */
    public function destroy($id)
    {
        $service = DentalService::findOrFail($id);
        
        // Delete all associated appointments
        $service->appointments()->delete();
        
        // Now delete the service
        $service->delete();
        
        if (request()->wantsJson()) {
            return response()->json([
                'message' => 'Dental service and all associated appointments have been deleted successfully',
            ]);
        }
        
        return redirect()->route('admin.dental-services')
            ->with('success', 'Dental service and all associated appointments have been deleted successfully');
    }
    
    /**
     * Toggle the active status of a dental service.
     */
    public function toggleStatus($id)
    {
        $service = DentalService::findOrFail($id);
        $service->is_active = !$service->is_active;
        $service->save();
        
        return redirect()->route('admin.dental-services')
            ->with('success', 'Service status updated successfully');
    }
}
