<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Admin Dashboard", description: "Admin exclusive dashboard statistics and reporting")]
class DashboardController extends Controller
{
    /**
     * Get comprehensive dashboard statistics (admin only).
     */
    #[OA\Get(
        path: "/api/dashboard/stats",
        summary: "Get overall store stats, revenue, orders & staff list (Admin only)",
        tags: ["Admin Dashboard"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(response: 200, description: "Dashboard summary data"),
            new OA\Response(response: 403, description: "Forbidden - Admin access required")
        ]
    )]
    public function stats(Request $request)
    {
        $total_users    = User::count();
        $total_projects = Project::count();
        $pending_projects = Project::where('status', 'pending')->count();
        $total_revenue  = (float) Order::sum('total');

        $recentOrders   = Order::orderByDesc('id')->limit(5)->get();
        $pendingProjects = Project::where('status', 'pending')->orderByDesc('id')->get();
        $allProducts    = Project::orderByDesc('id')->get();
        $allOrders      = Order::orderByDesc('id')->get();
        $cashiers       = User::where('role', 'user')
                            ->orderByDesc('id')
                            ->select('id', 'name', 'email', 'role', 'created_at')
                            ->get();

        return response()->json([
            'stats' => [
                'total_users'      => $total_users,
                'total_revenue'    => $total_revenue,
                'total_projects'   => $total_projects,
                'pending_projects' => $pending_projects,
            ],
            'recentOrders'    => $recentOrders,
            'pendingProjects' => $pendingProjects,
            'allProducts'     => $allProducts,
            'allOrders'       => $allOrders,
            'cashiers'        => $cashiers,
        ]);
    }
}
