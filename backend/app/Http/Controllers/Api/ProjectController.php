<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Products & Projects", description: "Endpoints for managing drinks & coffee product catalog")]
class ProjectController extends Controller
{
    /**
     * Get products list.
     */
    #[OA\Get(
        path: "/api/projects",
        summary: "Get list of menu products / drinks",
        tags: ["Products & Projects"],
        parameters: [
            new OA\Parameter(name: "status", in: "query", required: false, description: "Filter status (admin only)", schema: new OA\Schema(type: "string"))
        ],
        responses: [
            new OA\Response(response: 200, description: "List of products")
        ]
    )]
    public function index(Request $request)
    {
        $user   = $request->user();
        $status = $request->query('status');

        if ($user && $user->isAdmin()) {
            $query = Project::with('user:id,name,email')->orderByDesc('id');
            if ($status) {
                $query->where('status', $status);
            }
        } else {
            $query = Project::with('user:id,name,email')
                ->where('status', 'approved')
                ->orderByDesc('id');
        }

        return response()->json($query->get());
    }

    /**
     * Create a new product (admin/auth required).
     */
    #[OA\Post(
        path: "/api/projects",
        summary: "Add a new drink product to menu",
        tags: ["Products & Projects"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["title", "price", "category"],
                properties: [
                    new OA\Property(property: "title", type: "string", example: "Matcha Latte"),
                    new OA\Property(property: "price", type: "number", example: 3.50),
                    new OA\Property(property: "category", type: "string", example: "Milk Tea"),
                    new OA\Property(property: "image", type: "string", example: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500"),
                    new OA\Property(property: "description", type: "string", example: "Creamy iced matcha latte with fresh milk")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Product created successfully")
        ]
    )]
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'price'       => 'required|numeric|min:0',
            'category'    => 'required|string|max:100',
            'image'       => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $project = Project::create([
            'user_id'     => $request->user()->id,
            'title'       => $data['title'],
            'price'       => (float) $data['price'],
            'category'    => $data['category'],
            'image'       => $data['image'] ?? 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500',
            'description' => $data['description'] ?? 'A delicious new addition to our menu.',
            'status'      => 'approved',
        ]);

        return response()->json([
            'message' => 'Product added successfully!',
            'project' => $project,
        ], 201);
    }

    /**
     * Update an existing product.
     */
    #[OA\Put(
        path: "/api/projects/{id}",
        summary: "Update an existing drink product",
        tags: ["Products & Projects"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "title", type: "string", example: "Iced Brown Sugar Boba"),
                    new OA\Property(property: "price", type: "number", example: 4.00),
                    new OA\Property(property: "category", type: "string", example: "Milk Tea")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Product updated successfully")
        ]
    )]
    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $data = $request->validate([
            'title'       => 'nullable|string|max:255',
            'price'       => 'nullable|numeric|min:0',
            'category'    => 'nullable|string|max:100',
            'image'       => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $project->update(array_filter($data, fn($v) => ! is_null($v)));

        return response()->json([
            'message' => 'Product updated successfully!',
            'project' => $project->fresh(),
        ]);
    }

    /**
     * Delete a product.
     */
    #[OA\Delete(
        path: "/api/projects/{id}",
        summary: "Delete a drink product",
        tags: ["Products & Projects"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Product deleted successfully")
        ]
    )]
    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();

        return response()->json(['message' => 'Product deleted successfully!']);
    }

    /**
     * Update product status (admin only).
     */
    #[OA\Post(
        path: "/api/projects/{id}/status",
        summary: "Approve or reject a product (Admin only)",
        tags: ["Products & Projects"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["status"],
                properties: [
                    new OA\Property(property: "status", type: "string", enum: ["pending", "approved", "rejected"], example: "approved")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Status updated")
        ]
    )]
    public function updateStatus(Request $request, $id)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $project = Project::findOrFail($id);
        $project->update(['status' => $data['status']]);

        return response()->json([
            'message' => 'Product status updated successfully!',
            'project' => $project,
        ]);
    }
}
