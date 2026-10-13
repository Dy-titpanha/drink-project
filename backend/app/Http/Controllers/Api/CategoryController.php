<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Categories", description: "Endpoints for managing beverage & menu categories")]
class CategoryController extends Controller
{
    /**
     * Get list of active categories.
     */
    #[OA\Get(
        path: "/api/categories",
        summary: "Get list of menu categories",
        tags: ["Categories"],
        responses: [
            new OA\Response(response: 200, description: "List of categories")
        ]
    )]
    public function index()
    {
        $categories = Category::where('is_active', true)->orderBy('id')->get();
        return response()->json($categories);
    }

    /**
     * Store a new category (Admin/Auth).
     */
    #[OA\Post(
        path: "/api/categories",
        summary: "Create a new category",
        tags: ["Categories"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["name"],
                properties: [
                    new OA\Property(property: "name", type: "string", example: "Fruit Tea"),
                    new OA\Property(property: "icon", type: "string", example: "🍹"),
                    new OA\Property(property: "description", type: "string", example: "Refreshing iced fruit tea drinks")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Category created")
        ]
    )]
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name',
            'icon'        => 'nullable|string|max:50',
            'description' => 'nullable|string',
        ]);

        $category = Category::create([
            'name'        => $data['name'],
            'slug'        => Str::slug($data['name']),
            'icon'        => $data['icon'] ?? '🧋',
            'description' => $data['description'] ?? null,
            'is_active'   => true,
        ]);

        return response()->json([
            'message'  => 'Category created successfully!',
            'category' => $category,
        ], 201);
    }
}
