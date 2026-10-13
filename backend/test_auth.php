<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$users = App\Models\User::all();
echo "Total users: " . $users->count() . "\n";
foreach ($users as $user) {
    echo $user->email . "\n";
    $isValid = Illuminate\Support\Facades\Hash::check('password123', $user->password);
    echo "  Password 'password123' is valid? " . ($isValid ? 'YES' : 'NO') . "\n";
}
