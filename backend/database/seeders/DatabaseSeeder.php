<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ─── 1. ADMIN ACCOUNTS ────────────────────────────────────────────────
        $admins = [
            [
                'name'     => 'System Admin',
                'email'    => 'admin@cafe.com',
                'password' => Hash::make('password123'),
                'role'     => 'admin',
            ],
            [
                'name'     => 'Vat Milktea Admin',
                'email'    => 'admin@vatmilktea.com',
                'password' => Hash::make('password123'),
                'role'     => 'admin',
            ],
            [
                'name'     => 'Super Admin',
                'email'    => 'superadmin@systemcafe.com',
                'password' => Hash::make('password123'),
                'role'     => 'admin',
            ],
            [
                'name'     => 'Store Manager',
                'email'    => 'manager@systemcafe.com',
                'password' => Hash::make('password123'),
                'role'     => 'admin',
            ],
        ];

        foreach ($admins as $adminData) {
            User::updateOrCreate(['email' => $adminData['email']], $adminData);
        }

        // ─── 2. STAFF / CASHIER ACCOUNTS ──────────────────────────────────────
        $staffUsers = [
            [
                'name'     => 'Staff User',
                'email'    => 'user@cafe.com',
                'password' => Hash::make('password123'),
                'role'     => 'user',
            ],
            [
                'name'     => 'Vat Milktea Cashier',
                'email'    => 'cashier@vatmilktea.com',
                'password' => Hash::make('password123'),
                'role'     => 'user',
            ],
            [
                'name'     => 'Lead Barista',
                'email'    => 'barista@systemcafe.com',
                'password' => Hash::make('password123'),
                'role'     => 'user',
            ],
            [
                'name'     => 'Front Desk Cashier',
                'email'    => 'staff2@systemcafe.com',
                'password' => Hash::make('password123'),
                'role'     => 'user',
            ],
        ];

        foreach ($staffUsers as $staffData) {
            User::updateOrCreate(['email' => $staffData['email']], $staffData);
        }

        // ─── 3. CUSTOMER ACCOUNTS ─────────────────────────────────────────────
        $customers = [
            [
                'name'     => 'Customer User',
                'email'    => 'customer@cafe.com',
                'password' => Hash::make('password123'),
                'role'     => 'customer',
            ],
            [
                'name'     => 'John Doe',
                'email'    => 'john.doe@example.com',
                'password' => Hash::make('password123'),
                'role'     => 'customer',
            ],
            [
                'name'     => 'Sophia Latte',
                'email'    => 'sophia.latte@example.com',
                'password' => Hash::make('password123'),
                'role'     => 'customer',
            ],
            [
                'name'     => 'Alex Boba',
                'email'    => 'alex.boba@example.com',
                'password' => Hash::make('password123'),
                'role'     => 'customer',
            ],
            [
                'name'     => 'Lisa Tea',
                'email'    => 'lisa.tea@example.com',
                'password' => Hash::make('password123'),
                'role'     => 'customer',
            ],
        ];

        foreach ($customers as $customerData) {
            User::updateOrCreate(['email' => $customerData['email']], $customerData);
        }

        // ─── 4. CATEGORIES ───────────────────────────────────────────────────
        $categories = [
            [
                'name'        => 'Milk Tea',
                'icon'        => '🧋',
                'description' => 'Classic and signature milk teas infused with premium tea leaves.',
            ],
            [
                'name'        => 'Coffee & Espresso',
                'icon'        => '☕',
                'description' => 'Freshly brewed Arabica espresso, cold brews, and handcrafted coffee drinks.',
            ],
            [
                'name'        => 'Fruit Tea',
                'icon'        => '🍹',
                'description' => 'Refreshing iced fruit infusions squeezed from real fresh fruits.',
            ],
            [
                'name'        => 'Matcha & Tea',
                'icon'        => '🍵',
                'description' => 'Authentic Japanese Uji matcha and traditional premium leaf teas.',
            ],
            [
                'name'        => 'Smoothies & Frappes',
                'icon'        => '🥤',
                'description' => 'Rich blended ice smoothies, yogurt ice blends, and creamy frappes.',
            ],
            [
                'name'        => 'Bakery & Pastries',
                'icon'        => '🥐',
                'description' => 'Freshly baked flaky croissants, cheese tarts, and gourmet pastries.',
            ],
            [
                'name'        => 'Desserts & Ice Cream',
                'icon'        => '🍨',
                'description' => 'Decadent soft serve ice creams, boba sundaes, and sweet desserts.',
            ],
            [
                'name'        => 'Toppings & Add-ons',
                'icon'        => '🍬',
                'description' => 'Tapioca boba pearls, egg pudding, coconut jelly, and salted cream cheese foam.',
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['name' => $cat['name']],
                [
                    'slug'        => Str::slug($cat['name']),
                    'icon'        => $cat['icon'],
                    'description' => $cat['description'],
                    'is_active'   => true,
                ]
            );
        }

        // ─── 5. PRODUCTS (PROJECTS) CATALOG ──────────────────────────────────
        $adminUser = User::where('role', 'admin')->first();
        $adminId   = $adminUser ? $adminUser->id : 1;

        $products = [
            // --- MILK TEA ---
            [
                'title'       => 'Brown Sugar Pearl Milk Tea',
                'price'       => 3.50,
                'category'    => 'Milk Tea',
                'image'       => 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&q=80',
                'description' => 'Signature rich brown sugar syrup caramelized with warm tapioca boba pearls and fresh cream milk.',
            ],
            [
                'title'       => 'Taro Milk Tea with Boba',
                'price'       => 3.80,
                'category'    => 'Milk Tea',
                'image'       => 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&q=80',
                'description' => 'Creamy velvet taro root blended with black tea and chewy tapioca boba pearls.',
            ],
            [
                'title'       => 'Classic Thai Milk Tea',
                'price'       => 3.50,
                'category'    => 'Milk Tea',
                'image'       => 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80',
                'description' => 'Aromatic spiced Thai tea topped with sweet condensed milk over ice.',
            ],
            [
                'title'       => 'Roasted Oolong Milk Tea',
                'price'       => 3.75,
                'category'    => 'Milk Tea',
                'image'       => 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&q=80',
                'description' => 'Deeply roasted Tieguanyin oolong tea infused with silky smooth fresh milk.',
            ],
            [
                'title'       => 'Mango Coconut Milk Tea',
                'price'       => 4.00,
                'category'    => 'Milk Tea',
                'image'       => 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&q=80',
                'description' => 'Tropical ripe mango puree combined with rich coconut milk and jasmine green tea.',
            ],
            [
                'title'       => 'Okinawa Brown Sugar Milk Tea',
                'price'       => 4.25,
                'category'    => 'Milk Tea',
                'image'       => 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80',
                'description' => 'Traditional roasted Kokuto brown sugar from Okinawa with black milk tea.',
            ],

            // --- COFFEE & ESPRESSO ---
            [
                'title'       => 'Espresso Iced Americano',
                'price'       => 2.50,
                'category'    => 'Coffee & Espresso',
                'image'       => 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80',
                'description' => 'Double shot fresh Arabica espresso poured over cold filtered water and ice.',
            ],
            [
                'title'       => 'Salted Caramel Cream Latte',
                'price'       => 4.20,
                'category'    => 'Coffee & Espresso',
                'image'       => 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80',
                'description' => 'Rich espresso with steamed milk, sweet caramel drizzle, and sea salt cheese foam layer.',
            ],
            [
                'title'       => 'Vanilla Sweet Cold Brew',
                'price'       => 3.90,
                'category'    => 'Coffee & Espresso',
                'image'       => 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80',
                'description' => '20-hour steep cold brew coffee topped with house-made vanilla sweet cream.',
            ],
            [
                'title'       => 'Spanish Latte',
                'price'       => 4.50,
                'category'    => 'Coffee & Espresso',
                'image'       => 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&q=80',
                'description' => 'Bold espresso paired with textured steamed milk and sweet condensed milk accent.',
            ],
            [
                'title'       => 'Hazelnut Mocha Cloud',
                'price'       => 4.25,
                'category'    => 'Coffee & Espresso',
                'image'       => 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=600&q=80',
                'description' => 'Dark chocolate syrup and roasted hazelnut flavor shaken with espresso and milk.',
            ],

            // --- FRUIT TEA ---
            [
                'title'       => 'Fresh Passion Fruit Green Tea',
                'price'       => 3.75,
                'category'    => 'Fruit Tea',
                'image'       => 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&q=80',
                'description' => 'Real passion fruit pulp and seeds crushed with iced jasmine green tea and coconut jelly.',
            ],
            [
                'title'       => 'Mango Jasmine Green Tea',
                'price'       => 3.95,
                'category'    => 'Fruit Tea',
                'image'       => 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80',
                'description' => 'Fresh juicy mango chunks layered with floral jasmine tea and crystal pearls.',
            ],
            [
                'title'       => 'Sparkling Strawberry Peach Tea',
                'price'       => 4.10,
                'category'    => 'Fruit Tea',
                'image'       => 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=600&q=80',
                'description' => 'Sparkling water infused with sweet white peach, strawberry puree, and crushed mint.',
            ],
            [
                'title'       => 'Dragonfruit Lychee Cooler',
                'price'       => 4.25,
                'category'    => 'Fruit Tea',
                'image'       => 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&q=80',
                'description' => 'Vibrant magenta red dragonfruit mixed with sweet lychee juice and iced green tea.',
            ],

            // --- MATCHA & TEA ---
            [
                'title'       => 'Iced Matcha Green Tea Latte',
                'price'       => 3.75,
                'category'    => 'Matcha & Tea',
                'image'       => 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80',
                'description' => 'Authentic ceremonial grade Uji matcha whisked with fresh whole milk over ice.',
            ],
            [
                'title'       => 'Strawberry Matcha Cloud Latte',
                'price'       => 4.50,
                'category'    => 'Matcha & Tea',
                'image'       => 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=600&q=80',
                'description' => 'Layered fresh strawberry compote, chilled milk, and bright green matcha foam.',
            ],
            [
                'title'       => 'Jasmine Dragon Pearl Tea',
                'price'       => 3.25,
                'category'    => 'Matcha & Tea',
                'image'       => 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80',
                'description' => 'Hand-rolled jasmine dragon pearl green tea brewed fresh with natural blossom fragrance.',
            ],

            // --- SMOOTHIES & FRAPPES ---
            [
                'title'       => 'Avocado Coconut Smoothie',
                'price'       => 4.75,
                'category'    => 'Smoothies & Frappes',
                'image'       => 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&q=80',
                'description' => 'Fresh creamy Hass avocado blended with rich coconut cream and condensed milk.',
            ],
            [
                'title'       => 'Mixed Berry Yogurt Smoothie',
                'price'       => 4.60,
                'category'    => 'Smoothies & Frappes',
                'image'       => 'https://images.unsplash.com/photo-1502741126161-b048400d085d?w=600&q=80',
                'description' => 'Blueberry, raspberry, and strawberry puree blended with Greek yogurt and ice.',
            ],
            [
                'title'       => 'Cookies & Cream Cookie Frappe',
                'price'       => 4.50,
                'category'    => 'Smoothies & Frappes',
                'image'       => 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80',
                'description' => 'Crushed Oreo cookies blended with chocolate fudge, vanilla ice cream, and whipped topping.',
            ],

            // --- BAKERY & PASTRIES ---
            [
                'title'       => 'French Butter Croissant',
                'price'       => 2.80,
                'category'    => 'Bakery & Pastries',
                'image'       => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',
                'description' => 'Classic French golden flaky butter croissant baked fresh daily.',
            ],
            [
                'title'       => 'Matcha Cheese Tart',
                'price'       => 3.50,
                'category'    => 'Bakery & Pastries',
                'image'       => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
                'description' => 'Warm buttery pastry crust filled with molten matcha green tea cream cheese.',
            ],
            [
                'title'       => 'Fudge Chocolate Brownie',
                'price'       => 3.00,
                'category'    => 'Bakery & Pastries',
                'image'       => 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
                'description' => 'Dense Belgian chocolate brownie loaded with chocolate chunks and walnuts.',
            ],

            // --- DESSERTS & ICE CREAM ---
            [
                'title'       => 'Boba Milk Tea Sundae',
                'price'       => 4.00,
                'category'    => 'Desserts & Ice Cream',
                'image'       => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80',
                'description' => 'Soft serve milk tea ice cream drizzled with warm brown sugar pearls.',
            ],
            [
                'title'       => 'Mango Sticky Rice Parfait',
                'price'       => 4.50,
                'category'    => 'Desserts & Ice Cream',
                'image'       => 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80',
                'description' => 'Fresh sweet mango slices with coconut sweet sticky rice and toasted sesame seeds.',
            ],
        ];

        foreach ($products as $prod) {
            Project::updateOrCreate(
                ['title' => $prod['title']],
                [
                    'user_id'     => $adminId,
                    'price'       => $prod['price'],
                    'category'    => $prod['category'],
                    'image'       => $prod['image'],
                    'description' => $prod['description'],
                    'status'      => 'approved',
                ]
            );
        }
    }
}
