<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class OptionalAuth
{
    public function handle(Request $request, Closure $next)
    {
        $header = $request->header('Authorization', '');

        if (str_starts_with($header, 'Bearer ')) {
            $token = substr($header, 7);
            $pat   = PersonalAccessToken::findToken($token);

            if ($pat) {
                $request->setUserResolver(fn() => $pat->tokenable);
            }
        }

        return $next($request);
    }
}
