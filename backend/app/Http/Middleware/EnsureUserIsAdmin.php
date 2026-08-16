<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/*
|--------------------------------------------------------------------------
| MIDDLEWARE: only platform admins may pass
|--------------------------------------------------------------------------
|
| Middleware is a checkpoint that every request must clear BEFORE it reaches
| the controller. Putting the check here rather than at the top of each
| controller method means you cannot forget it on a new method later.
|
| Two different questions are being asked, and it helps to keep them apart:
|
|     AUTHENTICATION - "who are you?"      -> handled by auth:sanctum
|     AUTHORISATION  - "are you allowed?"  -> handled by THIS class
|
| The answer comes from the `role` column on the users table, which is an
| ENUM('adopter','shelter_staff','platform_admin'). Storing permissions in a
| constrained column like this - instead of, say, a free-text field - means an
| invalid role can never be written in the first place.
|
*/
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // 401 Unauthorized = "I do not know who you are" (no/invalid token).
        if (! $user) {
            return response()->json([
                'message' => 'You must be logged in to do this.',
            ], 401);
        }

        // 403 Forbidden = "I know exactly who you are, and the answer is no."
        // A logged-in adopter hitting an admin route belongs here, not in 401.
        if ($user->role !== 'platform_admin') {
            return response()->json([
                'message' => 'Only platform administrators can manage shelters.',
            ], 403);
        }

        // Cleared both checks - hand the request on to the controller.
        return $next($request);
    }
}
