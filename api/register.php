<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Método no permitido.'], 405);
}

$data = requestData();
$fullName = trim((string) ($data['fullName'] ?? ''));
$email = trim((string) ($data['email'] ?? ''));
$password = (string) ($data['password'] ?? '');
$goal = trim((string) ($data['goal'] ?? ''));
$termsAccepted = ($data['termsAccepted'] ?? false) === true;
$errors = [];

if ($fullName === '') {
    $errors['fullName'] = 'Escribe tu nombre completo.';
} elseif (mb_strlen($fullName) > 120) {
    $errors['fullName'] = 'El nombre no puede superar los 120 caracteres.';
}

if ($email === '') {
    $errors['email'] = 'Escribe tu correo electrónico.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
    $errors['email'] = 'Introduce un correo válido.';
}

if (strlen($password) < 8) {
    $errors['password'] = 'La contraseña debe tener al menos 8 caracteres.';
}

$allowedGoals = ['tareas', 'concentracion', 'habitos', 'proyectos'];
if (!in_array($goal, $allowedGoals, true)) {
    $errors['goal'] = 'Selecciona una opción.';
}

if (!$termsAccepted) {
    $errors['terms'] = 'Debes aceptar los términos para continuar.';
}

if ($errors) {
    sendJson(['success' => false, 'errors' => $errors], 422);
}

try {
    $pdo = database();
    $exists = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $exists->execute(['email' => $email]);

    if ($exists->fetch()) {
        sendJson(['success' => false, 'errors' => ['email' => 'Ya existe una cuenta con este correo.']], 409);
    }

    $insert = $pdo->prepare('INSERT INTO users (full_name, email, password_hash, goal) VALUES (:full_name, :email, :password_hash, :goal)');
    $insert->execute([
        'full_name' => $fullName,
        'email' => $email,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'goal' => $goal,
    ]);

    startUserSession();
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $pdo->lastInsertId();
    $_SESSION['user_name'] = $fullName;
    $_SESSION['user_email'] = $email;

    sendJson([
        'success' => true,
        'user' => ['name' => $fullName, 'email' => $email],
    ], 201);
} catch (PDOException $exception) {
    sendJson(['success' => false, 'message' => 'No pudimos crear tu cuenta. Inténtalo de nuevo.'], 500);
}
