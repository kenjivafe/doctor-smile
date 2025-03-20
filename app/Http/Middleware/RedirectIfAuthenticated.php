<?php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // Get user role and redirect to appropriate dashboard
                $user = Auth::guard($guard)->user();
                
                if ($user->role === 'admin') {
                    return redirect()->route('admin.analytics');
                } elseif ($user->role === 'dentist') {
                    return redirect()->route('dentist.appointments');
                } elseif ($user->role === 'patient') {
                    return redirect()->route('dashboard');
                }
                
                return redirect(RouteServiceProvider::HOME);
            }
        }

        return $next($request);
    }
}
