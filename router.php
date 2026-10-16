<?php
// router.php — Local PHP built-in server router
// Usage: php -S localhost:8080 router.php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Route /new-launch slug directly to index.html
if ($uri === '/new-launch' || $uri === '/new-launch/') {
    require __DIR__ . '/index.html';
    return true;
}

// Return false to let the built-in server handle all static and PHP files normally
return false;
