<?php
declare(strict_types=1);

// XAMPP defaults. Change these before hosting anywhere else.
const DB_HOST = '127.0.0.1';
const DB_NAME = 'parkganern_parking';
const DB_USER = 'root';
const DB_PASS = '';

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
    }
    return $pdo;
}

function boot(): void
{
    date_default_timezone_set('Asia/Manila');
    // "Remember me" sessions must outlive PHP's 24 minute default.
    ini_set('session.gc_maxlifetime', '2592000');
    session_name('parkganern');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();

    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
}

function json_input(): array
{
    $data = json_decode(file_get_contents('php://input') ?: '[]', true);
    return is_array($data) ? $data : [];
}

function respond(array $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(int $status, string $message): never
{
    respond(['error' => $message], $status);
}

function require_auth(): array
{
    $id = $_SESSION['user_id'] ?? null;
    if (!$id) {
        fail(401, 'Your session has expired. Please sign in again.');
    }
    $stmt = db()->prepare('SELECT id, username, email, full_name, role FROM users WHERE id = ?');
    $stmt->execute([$id]);
    $user = $stmt->fetch();
    if (!$user) {
        $_SESSION = [];
        fail(401, 'Your session has expired. Please sign in again.');
    }
    // Release the session file lock so parallel page requests are not serialized.
    session_write_close();
    return $user;
}

function public_user(array $row): array
{
    $parts = array_values(array_filter(preg_split('/[.\s_-]+/', trim($row['full_name'])) ?: []));
    $initials = strtoupper(implode('', array_map(
        static fn (string $part): string => mb_substr($part, 0, 1),
        array_slice($parts, 0, 2)
    ))) ?: 'PG';

    return [
        'id' => 'user-' . $row['id'],
        'username' => $row['username'],
        'fullName' => $row['full_name'],
        'initials' => $initials,
        'role' => $row['role'],
        'email' => $row['email'],
    ];
}

function record_payload(array $row): array
{
    $entered = strtotime($row['entered_at']);
    $exited = $row['exited_at'] ? strtotime($row['exited_at']) : null;
    return [
        'id' => 'record-' . $row['id'],
        'plate' => $row['plate'],
        'model' => $row['model'],
        'slot' => $row['slot'],
        'timeIn' => strtolower(date('g:iA', $entered)),
        'timeOut' => $exited ? strtolower(date('g:iA', $exited)) : null,
        'enteredAt' => date('c', $entered),
        'exitedAt' => $exited ? date('c', $exited) : null,
        'driver' => $row['driver'],
        'contact' => $row['contact'],
        'classification' => $row['classification'],
        'studentId' => $row['student_id'],
    ];
}
