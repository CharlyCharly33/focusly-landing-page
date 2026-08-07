<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

startUserSession();

if (!isset($_SESSION['user_id'], $_SESSION['user_name'], $_SESSION['user_email'])) {
    sendJson(['success' => true, 'loggedIn' => false]);
}

sendJson([
    'success' => true,
    'loggedIn' => true,
    'user' => [
        'name' => $_SESSION['user_name'],
        'email' => $_SESSION['user_email'],
    ],
]);
