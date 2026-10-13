<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Laravel 13 / Symfony 8.1 need PHP >= 8.4 (property hooks). Without this
// guard an older interpreter fails with "syntax error ... in Request.php
// line 117" while parsing vendor files.
if (PHP_VERSION_ID < 80400) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    echo sprintf(
        "PHP %s is not supported — this project requires PHP >= 8.4.\n".
        "Serve the backend with C:\\wamp\\bin\\php\\php8.4.0\\php.exe (see start.ps1).\n",
        PHP_VERSION
    );
    exit(1);
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
