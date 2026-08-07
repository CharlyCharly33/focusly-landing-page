<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Método no permitido.'], 405);
}

$data = requestData();
$email = trim((string) ($data['email'] ?? ''));
$password = (string) ($data['password'] ?? '');
$errors = [];

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Introduce un correo válido.';
}
if ($password === '') {
    $errors['password'] = 'Escribe tu contraseña.';
}
if ($errors) {
    sendJson(['success' => false, 'errors' => $errors], 422);
}

try {
    $pdo = database();
    $statement = $pdo->prepare('SELECT id, full_name, email, password_hash FROM users WHERE email = :email LIMIT 1');
    $statement->execute(['email' => $email]);
    $user = $statement->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        sendJson(['success' => false, 'message' => 'Correo o contraseña incorrectos.'], 401);
    }

    startUserSession();
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $user['id'];
    $_SESSION['user_name'] = $user['full_name'];
    $_SESSION['user_email'] = $user['email'];

    sendJson([
        'success' => true,
        'user' => ['name' => $user['full_name'], 'email' => $user['email']],
    ]);
} catch (PDOException $exception) {
    sendJson(['success' => false, 'message' => 'No pudimos iniciar sesión. Inténtalo de nuevo.'], 500);
}
