<?php
try {
    $pdo = new PDO("pgsql:host=127.0.0.1;port=5432;dbname=system_cafe", "postgres", "postgres");
    echo "PostgreSQL Connection Successful!\n";
    $stmt = $pdo->query("SELECT count(*) FROM users");
    echo "Users count: " . $stmt->fetchColumn() . "\n";
} catch (Exception $e) {
    echo "Connection error: " . $e->getMessage() . "\n";
}
