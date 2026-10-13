<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Orders & Checkout", description: "Endpoints for Customer / POS Order Checkout")]
class OrderController extends Controller
{
    /**
     * Process a checkout (place order).
     */
    #[OA\Post(
        path: "/api/checkout",
        summary: "Place a new order (Checkout)",
        tags: ["Orders & Checkout"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["cart", "payment_method"],
                properties: [
                    new OA\Property(
                        property: "cart",
                        type: "array",
                        items: new OA\Items(
                            properties: [
                                new OA\Property(property: "id", type: "integer", example: 1),
                                new OA\Property(property: "price", type: "number", example: 3.50),
                                new OA\Property(property: "quantity", type: "integer", example: 2)
                            ]
                        )
                    ),
                    new OA\Property(property: "payment_method", type: "string", example: "ABA KHQR"),
                    new OA\Property(property: "customer_name", type: "string", example: "John Customer")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Order placed successfully"),
            new OA\Response(response: 500, description: "Checkout failed")
        ]
    )]
    public function checkout(Request $request)
    {
        $data = $request->validate([
            'cart'           => 'required|array|min:1',
            'cart.*.id'      => 'required|integer',
            'cart.*.price'   => 'required|numeric',
            'cart.*.quantity'=> 'required|integer|min:1',
            'payment_method' => 'required|string',
            'customer_name'  => 'nullable|string|max:255',
        ]);

        // Calculate totals
        $total    = collect($data['cart'])->sum(fn($i) => (float)$i['price'] * $i['quantity']);
        $subtotal = $total * 0.9;
        $tax      = $total * 0.1;
        $grandTotal = $total * 1.1;

        // Generate unique reference number
        $ref_number = 'MM-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));

        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id'        => $request->user()->id,
                'ref_number'     => $ref_number,
                'subtotal'       => $subtotal,
                'tax'            => $tax,
                'total'          => $grandTotal,
                'payment_method' => $data['payment_method'],
                'payment_status' => 'Paid',
                'order_type'     => 'Online',
                'customer_name'  => $data['customer_name'] ?? $request->user()->name,
            ]);

            foreach ($data['cart'] as $item) {
                $project = Project::find($item['id']);
                if (! $project) {
                    throw new \Exception("Product with ID {$item['id']} not found.");
                }

                OrderItem::create([
                    'order_id'   => $order->id,
                    'project_id' => $item['id'],
                    'quantity'   => $item['quantity'],
                    'price'      => (float) $item['price'],
                ]);
            }

            DB::commit();

            // Send Telegram notification asynchronously (best-effort)
            $this->sendTelegramNotification($order);

            return response()->json([
                'message' => 'Order placed successfully!',
                'order'   => $order,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error placing order.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Place an EZorder — a self-service order created by a customer
     * who scanned the table QR code. Public endpoint: no login needed.
     */
    #[OA\Post(
        path: "/api/orders",
        summary: "Place a new EZorder (QR scan-to-order, guest friendly)",
        tags: ["Orders & Checkout"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["cart", "customer_name", "order_type", "payment_method"],
                properties: [
                    new OA\Property(
                        property: "cart",
                        type: "array",
                        items: new OA\Items(
                            properties: [
                                new OA\Property(property: "id", type: "integer", example: 1),
                                new OA\Property(property: "quantity", type: "integer", example: 2)
                            ]
                        )
                    ),
                    new OA\Property(property: "customer_name", type: "string", example: "Sok Dara"),
                    new OA\Property(property: "phone", type: "string", example: "012345678"),
                    new OA\Property(property: "order_type", type: "string", enum: ["dine_in", "take_away"], example: "dine_in"),
                    new OA\Property(property: "table_number", type: "integer", nullable: true, example: 4),
                    new OA\Property(property: "payment_method", type: "string", example: "KHQR"),
                    new OA\Property(property: "notes", type: "string", nullable: true, example: "Less ice please")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "EZorder placed successfully"),
            new OA\Response(response: 400, description: "Validation or business rule failed")
        ]
    )]
    public function store(Request $request)
    {
        // ─── Step 1: Validate payload. On failure we short-circuit with a
        // 400 and never touch the database.
        $validator = Validator::make($request->all(), [
            'cart'                 => 'required|array|min:1|max:50',
            'cart.*.id'            => 'required|integer|min:1',
            'cart.*.quantity'      => 'required|integer|min:1|max:99',
            'customer_name'        => 'required|string|min:2|max:255',
            'phone'                => ['nullable', 'regex:/^0\d{8,9}$/'],
            'order_type'           => 'required|in:dine_in,take_away',
            'table_number'         => 'nullable|required_if:order_type,dine_in|integer|min:1|max:999',
            'payment_method'       => 'required|string|max:50',
            'notes'                => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors'  => $validator->errors(),
            ], 400);
        }

        $data = $validator->validated();

        // ─── Step 2: Business rules (still no DB writes).
        // Each product may appear only once in the cart.
        $ids = array_column($data['cart'], 'id');
        if (count($ids) !== count(array_unique($ids))) {
            return response()->json([
                'message' => 'Duplicate product lines are not allowed.',
                'errors'  => ['cart' => ['Each drink may appear only once in the cart.']],
            ], 400);
        }

        // Every ordered product must exist and be approved on the menu.
        $products = Project::whereIn('id', $ids)->where('status', 'approved')->get()->keyBy('id');
        foreach ($data['cart'] as $line) {
            if (! isset($products[$line['id']])) {
                return response()->json([
                    'message' => "Product #{$line['id']} is not available.",
                    'errors'  => ['cart' => ['One of the selected drinks is no longer on the menu. Please refresh and try again.']],
                ], 400);
            }
        }

        // Prices always come from the database — never trust client-sent prices.
        $base       = collect($data['cart'])->sum(fn ($l) => $products[$l['id']]->price * $l['quantity']);
        $subtotal   = round($base * 0.9, 2);
        $tax        = round($base * 0.1, 2);
        $grandTotal = round($base * 1.1, 2);

        $ref_number = 'EZ-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));

        // ─── Step 3 & 4: Transaction — insert order row + all line items
        // together; any failure rolls everything back so we never end up
        // with a half-created order.
        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id'        => $request->user()?->id,
                'ref_number'     => $ref_number,
                'subtotal'       => $subtotal,
                'tax'            => $tax,
                'total'          => $grandTotal,
                'payment_method' => $data['payment_method'],
                'payment_status' => 'pending',
                'order_type'     => $data['order_type'],
                'customer_name'  => trim($data['customer_name']),
                'table_number'   => $data['table_number'] ?? null,
                'notes'          => $data['notes'] ?? null,
                'source'         => 'ezorder',
            ]);

            foreach ($data['cart'] as $line) {
                OrderItem::create([
                    'order_id'   => $order->id,
                    'project_id' => $line['id'],
                    'quantity'   => $line['quantity'],
                    'price'      => $products[$line['id']]->price,
                ]);
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error placing order.',
                'error'   => $e->getMessage(),
            ], 500);
        }

        // ─── Step 5: Committed — fire best-effort Telegram receipt.
        $this->sendTelegramNotification($order);

        // ─── Step 6: Return 201 with the created order data for the UI.
        return response()->json([
            'message' => 'Order placed successfully!',
            'order'   => $order->load('items.project'),
        ], 201);
    }

    /**
     * Send Telegram bot notification for a new order.
     */
    private function sendTelegramNotification(Order $order): void
    {
        try {
            $token  = env('TELEGRAM_BOT_TOKEN');
            $chatId = env('TELEGRAM_CHAT_ID');

            if (! $token) return;

            // Auto-discover Chat ID if not set in .env
            if (! $chatId) {
                $response = Http::get("https://api.telegram.org/bot{$token}/getUpdates");
                if ($response->successful()) {
                    $results = $response->json('result');
                    if (! empty($results)) {
                        $lastResult = end($results);
                        $chatId = $lastResult['message']['chat']['id'] ?? $lastResult['my_chat_member']['chat']['id'] ?? null;
                    }
                }
            }

            if (! $chatId) return;

            $order->load(['items.project']);

            $message  = "🔔 *New Order Placed!*\n";
            $message .= "━━━━━━━━━━━━━━━━━━━━\n";
            $message .= "📌 *Order Ref:* `{$order->ref_number}`\n";
            $message .= "👤 *Customer:* " . ($order->customer_name ?: 'Walk-in') . "\n";
            $message .= "💳 *Payment:* {$order->payment_method}\n";
            $message .= "📦 *Type:* {$order->order_type}\n";
            $message .= "━━━━━━━━━━━━━━━━━━━━\n";
            $message .= "📝 *Items:*\n";

            foreach ($order->items as $item) {
                $title     = $item->project ? $item->project->title : 'Unknown Drink';
                $lineTotal = number_format($item->price * $item->quantity, 2);
                $message  .= "• {$title}  x{$item->quantity}  -  \${$lineTotal}\n";
            }

            $message .= "━━━━━━━━━━━━━━━━━━━━\n";
            $message .= "💵 *Subtotal:* \$" . number_format($order->subtotal, 2) . "\n";
            $message .= "📊 *Tax (10%):* \$" . number_format($order->tax, 2) . "\n";
            $message .= "💰 *Total Payable:* *\$" . number_format($order->total, 2) . "*\n";
            $message .= "📅 *Date:* " . $order->created_at->format('l, F d, Y \a\t h:i A') . "\n";

            Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id'    => $chatId,
                'text'       => $message,
                'parse_mode' => 'Markdown',
            ]);
        } catch (\Throwable $e) {
            \Log::error('Telegram notification failed: ' . $e->getMessage());
        }
    }
}
