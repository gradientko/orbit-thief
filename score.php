<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok'=>false,'error'=>'method_not_allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input') ?: '', true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok'=>false,'error'=>'invalid_json']);
    exit;
}

$won = filter_var($data['won'] ?? false, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE);
$score = filter_var($data['score'] ?? null, FILTER_VALIDATE_INT);
$turns = filter_var($data['turns'] ?? null, FILTER_VALIDATE_INT);
$fuel = filter_var($data['fuel'] ?? null, FILTER_VALIDATE_INT);

if ($won === null || $score === false || $turns === false || $fuel === false) {
    http_response_code(422);
    echo json_encode(['ok'=>false,'error'=>'invalid_payload']);
    exit;
}

if ($score < 0 || $score > 100000 || $turns < 0 || $turns > 1000 || $fuel < 0 || $fuel > 100) {
    http_response_code(422);
    echo json_encode(['ok'=>false,'error'=>'out_of_range']);
    exit;
}

if (!isset($_SESSION['orbit_thief_stats'])) {
    $_SESSION['orbit_thief_stats'] = [
        'runs'=>0,
        'wins'=>0,
        'best_score'=>0,
        'best_turns'=>null,
        'best_fuel'=>0,
    ];
}

$stats =& $_SESSION['orbit_thief_stats'];
$stats['runs']++;

if ($won) {
    $stats['wins']++;

    if ($stats['best_turns'] === null || $turns < $stats['best_turns']) {
        $stats['best_turns'] = $turns;
    }

    $stats['best_fuel'] = max($stats['best_fuel'], $fuel);
}

$stats['best_score'] = max($stats['best_score'], $score);

echo json_encode(['ok'=>true,'stats'=>$stats]);
