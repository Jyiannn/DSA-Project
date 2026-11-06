<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

boot();

$script = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/'));
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$route = trim(substr($path, strlen($script)), '/');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($route === '' || $route === 'index.php') {
    respond(['ok' => true, 'service' => 'parkganern-api']);
}

try {
    switch ($method . ' ' . $route) {
        case 'POST auth/login':
            login();
        case 'POST auth/logout':
            logout();
        case 'GET users/me':
            respond(['user' => public_user(require_auth())]);
        case 'GET dashboard':
            dashboard();
        case 'GET records':
            records();
        case 'POST registered-motorists':
            register_motorist();
        case 'POST parking-records':
            create_record();
        case 'POST parking-records/vacate':
            vacate();
        case 'POST parking-records/revisit':
            revisit();
        case 'GET parking-history':
            parking_history();
        default:
            fail(404, 'Endpoint not found.');
    }
} catch (PDOException $error) {
    error_log('parkganern api: ' . $error->getMessage());
    fail(500, 'The database is unavailable.');
} catch (Throwable $error) {
    error_log('parkganern api: ' . $error->getMessage());
    fail(500, 'The server could not complete the request.');
}

function login(): never
{
    $body = json_input();
    $username = trim((string) ($body['username'] ?? ''));
    $password = (string) ($body['password'] ?? '');

    if ($username === '') {
        fail(422, 'Enter your username or email address.');
    }
    if (strlen($password) < 6) {
        fail(422, 'Password must contain at least 6 characters.');
    }

    $stmt = db()->prepare('SELECT id, username, email, full_name, role, password_hash FROM users WHERE username = ? OR email = ? LIMIT 1');
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        fail(401, 'Incorrect username or password.');
    }

    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $user['id'];

    $remember = !empty($body['remember']);
    if ($remember) {
        setcookie(session_name(), session_id(), [
            'expires' => time() + 2592000,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }

    respond([
        'user' => public_user($user),
        'startedAt' => date('c'),
        'remember' => $remember,
    ]);
}

function logout(): never
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
    respond(['ok' => true]);
}

function records(): never
{
    require_auth();
    [, $records] = board();

    respond([
        'motorists' => saved_motorists(),
        'records' => array_map('record_payload', $records),
    ]);
}

// The saved-motorist directory: registered profiles joined with visit stats.
function saved_motorists(): array
{
    $rows = db()->query(
        'SELECT m.id, m.plate, m.model, m.owner, m.contact, m.classification, m.student_id, m.created_at,
                COALESCE(s.visits, 0) AS visits, s.last_seen, s.current_slot
         FROM registered_motorists m
         LEFT JOIN (
             SELECT plate, COUNT(*) AS visits, MAX(entered_at) AS last_seen,
                    MAX(CASE WHEN exited_at IS NULL THEN slot END) AS current_slot
             FROM parking_records
             GROUP BY plate
         ) s ON s.plate = m.plate
         ORDER BY m.created_at DESC, m.id DESC'
    )->fetchAll();

    return array_map(static fn (array $row): array => [
        'id' => 'motorist-' . $row['id'],
        'plate' => $row['plate'],
        'model' => $row['model'],
        'owner' => $row['owner'],
        'contact' => $row['contact'],
        'classification' => $row['classification'],
        'studentId' => $row['student_id'],
        'visits' => (int) $row['visits'],
        'lastSeen' => $row['last_seen'] ? date('c', strtotime($row['last_seen'])) : null,
        'currentSlot' => $row['current_slot'],
    ], $rows);
}

function board(): array
{
    $pdo = db();
    $spaces = $pdo->query('SELECT id, zone, type, status, rate FROM parking_spaces ORDER BY id')->fetchAll();
    foreach ($spaces as &$space) {
        $space['rate'] = (float) $space['rate'];
    }
    unset($space);

    $records = $pdo->query('SELECT * FROM parking_records ORDER BY entered_at DESC LIMIT 100')->fetchAll();

    return [$spaces, $records];
}

function dashboard(): never
{
    require_auth();
    [$spaces, $records] = board();

    $counts = ['available' => 0, 'occupied' => 0, 'reserved' => 0];
    foreach ($spaces as $space) {
        $counts[$space['status']]++;
    }

    // ?date=YYYY-MM-DD narrows the activity feed to that day; everything else is unchanged.
    $date = trim((string) ($_GET['date'] ?? ''));
    if ($date !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        fail(422, 'Date must be YYYY-MM-DD.');
    }
    if ($date !== '') {
        $stmt = db()->prepare('SELECT * FROM parking_records WHERE entered_at LIKE ? ORDER BY entered_at DESC');
        $stmt->execute([$date . '%']);
        $activity = $stmt->fetchAll();
    } else {
        $activity = array_slice($records, 0, 20);
    }

    respond([
        'statistics' => [
            ['id' => 'capacity', 'label' => 'Total Capacity', 'value' => count($spaces), 'detail' => 'Across the campus'],
            ['id' => 'available', 'label' => 'Available', 'value' => $counts['available'], 'detail' => 'Ready to use now', 'tone' => 'success'],
            ['id' => 'occupied', 'label' => 'Occupied', 'value' => $counts['occupied'], 'detail' => 'Currently in use'],
            ['id' => 'reserved', 'label' => 'Reserved', 'value' => $counts['reserved'], 'detail' => 'Awaiting arrival'],
        ],
        'spaces' => $spaces,
        'recentActivity' => array_map('record_payload', $activity),
        'occupants' => array_map('record_payload', db()->query('SELECT * FROM parking_records WHERE exited_at IS NULL ORDER BY entered_at DESC')->fetchAll()),
        'motorists' => saved_motorists(),
    ]);
}

function insert_record(PDO $pdo, array $data, string $slot): int
{
    $enteredAt = date('Y-m-d H:i:s');
    $pdo->prepare(
        'INSERT INTO parking_records (plate, model, slot, driver, contact, classification, student_id, entered_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $data['plate'],
        $data['model'],
        $slot,
        $data['driver'],
        $data['contact'],
        $data['classification'],
        $data['student_id'] ?: null,
        $enteredAt,
    ]);
    $recordId = (int) $pdo->lastInsertId();

    $pdo->prepare("UPDATE parking_spaces SET status = 'occupied' WHERE id = ?")->execute([$slot]);
    $pdo->prepare('INSERT INTO parking_history (record_id, event, occurred_at) VALUES (?, ?, ?)')
        ->execute([$recordId, 'Vehicle entered', $enteredAt]);

    return $recordId;
}

function create_record(): never
{
    require_auth();
    $body = json_input();

    $plate = strtoupper(trim((string) ($body['plate'] ?? '')));
    $owner = trim((string) ($body['ownerName'] ?? ''));
    $model = trim((string) ($body['motorcycleType'] ?? ''));
    // An empty slot means "auto park" — the server picks the nearest available space.
    $slot = strtoupper(trim((string) ($body['slot'] ?? '')));
    $classification = (string) ($body['classification'] ?? '');
    $studentId = trim((string) ($body['studentId'] ?? ''));
    $contact = trim((string) ($body['contact'] ?? ''));

    if ($plate === '' || mb_strlen($plate) > 20) {
        fail(422, 'Enter a valid license plate.');
    }
    if ($owner === '' || mb_strlen($owner) > 150) {
        fail(422, 'Enter the owner name.');
    }
    if ($model === '' || mb_strlen($model) > 100) {
        fail(422, 'Describe the motorcycle.');
    }
    if ($contact === '' || mb_strlen($contact) > 40) {
        fail(422, 'Enter a valid contact number.');
    }
    if (!in_array($classification, ['Student', 'School Staff', 'Visitor'], true)) {
        fail(422, 'Choose a valid classification.');
    }
    if ($slot !== '' && !preg_match('/^[A-Z]\d{1,3}$/', $slot)) {
        fail(422, 'Choose a valid parking slot.');
    }
    if (mb_strlen($studentId) > 40) {
        fail(422, 'That ID number is too long.');
    }

    $pdo = db();
    $pdo->beginTransaction();
    try {
        if ($slot === '') {
            $slot = $pdo->query("SELECT id FROM parking_spaces WHERE status = 'available' ORDER BY id LIMIT 1 FOR UPDATE")->fetchColumn();
            if (!$slot) {
                $pdo->rollBack();
                fail(409, 'All parking spaces are occupied.');
            }
        } else {
            $stmt = $pdo->prepare('SELECT status FROM parking_spaces WHERE id = ? FOR UPDATE');
            $stmt->execute([$slot]);
            $space = $stmt->fetch();

            if (!$space) {
                $pdo->rollBack();
                fail(404, 'That parking slot does not exist.');
            }
            if ($space['status'] !== 'available') {
                $pdo->rollBack();
                fail(409, 'That parking slot is already occupied.');
            }
        }

        $recordId = insert_record($pdo, [
            'plate' => $plate,
            'model' => $model,
            'driver' => $owner,
            'contact' => $contact,
            'classification' => $classification,
            'student_id' => $studentId,
        ], $slot);

        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }

    $stmt = $pdo->prepare('SELECT * FROM parking_records WHERE id = ?');
    $stmt->execute([$recordId]);
    respond(record_payload($stmt->fetch()), 201);
}

function vacate(): never
{
    require_auth();
    $body = json_input();
    $slot = strtoupper(trim((string) ($body['slot'] ?? '')));

    if (!preg_match('/^[A-Z]\d{1,3}$/', $slot)) {
        fail(422, 'Choose a valid parking slot.');
    }

    $pdo = db();
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('SELECT id FROM parking_records WHERE slot = ? AND exited_at IS NULL ORDER BY entered_at DESC LIMIT 1 FOR UPDATE');
        $stmt->execute([$slot]);
        $record = $stmt->fetch();

        if (!$record) {
            $pdo->rollBack();
            fail(409, 'That slot has no parked motorcycle.');
        }

        $exitedAt = date('Y-m-d H:i:s');
        $pdo->prepare('UPDATE parking_records SET exited_at = ? WHERE id = ?')->execute([$exitedAt, $record['id']]);
        $pdo->prepare("UPDATE parking_spaces SET status = 'available' WHERE id = ?")->execute([$slot]);
        $pdo->prepare('INSERT INTO parking_history (record_id, event, occurred_at) VALUES (?, ?, ?)')
            ->execute([$record['id'], 'Vehicle exited', $exitedAt]);

        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }

    $stmt = $pdo->prepare('SELECT * FROM parking_records WHERE id = ?');
    $stmt->execute([$record['id']]);
    respond(record_payload($stmt->fetch()));
}

function register_motorist(): never
{
    require_auth();
    $body = json_input();

    $plate = strtoupper(trim((string) ($body['plate'] ?? '')));
    $owner = trim((string) ($body['ownerName'] ?? ''));
    $model = trim((string) ($body['motorcycleType'] ?? ''));
    $classification = (string) ($body['classification'] ?? '');
    $studentId = trim((string) ($body['studentId'] ?? ''));
    $contact = trim((string) ($body['contact'] ?? ''));

    if ($plate === '' || mb_strlen($plate) > 20) {
        fail(422, 'Enter a valid license plate.');
    }
    if ($owner === '' || mb_strlen($owner) > 150) {
        fail(422, 'Enter the owner name.');
    }
    if ($model === '' || mb_strlen($model) > 100) {
        fail(422, 'Describe the motorcycle.');
    }
    if ($contact === '' || mb_strlen($contact) > 40) {
        fail(422, 'Enter a valid contact number.');
    }
    if (!in_array($classification, ['Student', 'School Staff', 'Visitor'], true)) {
        fail(422, 'Choose a valid classification.');
    }
    if (mb_strlen($studentId) > 40) {
        fail(422, 'That ID number is too long.');
    }

    $existing = db()->prepare('SELECT owner FROM registered_motorists WHERE plate = ?');
    $existing->execute([$plate]);
    $ownerRegistered = $existing->fetchColumn();
    if ($ownerRegistered) {
        fail(409, "That plate is already registered to $ownerRegistered.");
    }

    db()->prepare('INSERT INTO registered_motorists (plate, model, owner, contact, classification, student_id) VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([$plate, $model, $owner, $contact, $classification, $studentId ?: null]);

    respond(['ok' => true, 'plate' => $plate], 201);
}

function revisit(): never
{
    require_auth();
    $body = json_input();
    $plate = strtoupper(trim((string) ($body['plate'] ?? '')));
    // Empty slot means auto-assign the nearest available space.
    $slotRequest = strtoupper(trim((string) ($body['slot'] ?? '')));

    if ($plate === '') {
        fail(422, 'Choose a saved motorcycle.');
    }
    if ($slotRequest !== '' && !preg_match('/^[A-Z]\d{1,3}$/', $slotRequest)) {
        fail(422, 'Choose a valid parking slot.');
    }

    $pdo = db();
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('SELECT * FROM registered_motorists WHERE plate = ?');
        $stmt->execute([$plate]);
        $saved = $stmt->fetch();

        if (!$saved) {
            $pdo->rollBack();
            fail(404, 'That motorcycle is not registered. Register it first.');
        }

        $stmt = $pdo->prepare('SELECT slot FROM parking_records WHERE plate = ? AND exited_at IS NULL ORDER BY id DESC LIMIT 1');
        $stmt->execute([$plate]);
        $parkedIn = $stmt->fetchColumn();

        if ($parkedIn) {
            $pdo->rollBack();
            fail(409, "That motorcycle is already parked in $parkedIn.");
        }

        if ($slotRequest === '') {
            $slot = $pdo->query("SELECT id FROM parking_spaces WHERE status = 'available' ORDER BY id LIMIT 1 FOR UPDATE")->fetchColumn();
            if (!$slot) {
                $pdo->rollBack();
                fail(409, 'All parking spaces are occupied.');
            }
        } else {
            $stmt = $pdo->prepare('SELECT status FROM parking_spaces WHERE id = ? FOR UPDATE');
            $stmt->execute([$slotRequest]);
            $space = $stmt->fetch();

            if (!$space) {
                $pdo->rollBack();
                fail(404, 'That parking slot does not exist.');
            }
            if ($space['status'] !== 'available') {
                $pdo->rollBack();
                fail(409, 'That parking slot is already occupied.');
            }
            $slot = $slotRequest;
        }

        $recordId = insert_record($pdo, [
            'plate' => $saved['plate'],
            'model' => $saved['model'],
            'driver' => $saved['owner'],
            'contact' => $saved['contact'],
            'classification' => $saved['classification'],
            'student_id' => $saved['student_id'],
        ], $slot);
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }

    $stmt = $pdo->prepare('SELECT * FROM parking_records WHERE id = ?');
    $stmt->execute([$recordId]);
    respond(record_payload($stmt->fetch()), 201);
}

function parking_history(): never
{
    require_auth();
    $rows = db()->query(
        'SELECT id, record_id, event, occurred_at FROM parking_history ORDER BY occurred_at DESC, id DESC LIMIT 50'
    )->fetchAll();

    respond(array_map(static fn (array $row): array => [
        'id' => 'history-' . $row['id'],
        'event' => $row['event'],
        'recordId' => 'record-' . $row['record_id'],
        'occurredAt' => date('c', strtotime($row['occurred_at'])),
    ], $rows));
}
