<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'ref_number',
        'subtotal',
        'tax',
        'total',
        'payment_method',
        'payment_status',
        'order_type',
        'customer_name',
        'table_number',
        'notes',
        'source',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'float',
            'tax'      => 'float',
            'total'    => 'float',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
