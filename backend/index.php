<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$request_uri = explode('?', $_SERVER['REQUEST_URI'], 2)[0];
$method = $_SERVER['REQUEST_METHOD'];
$path = trim(parse_url($request_uri, PHP_URL_PATH), '/');

if ($path === 'index.php') {
    $path = '';
}

$path = preg_replace('#^(.+/)?index\.php/?#', '', $path);
// Route: Fetch all holidays (Accessible by everyone)
// Inside index.php

// 1. Double check your request URI normalization at the top of index.php


// 2. Update the Holiday matching logic to be flexible:
if ((str_ends_with($request_uri, '/holidays/list') || str_contains($request_uri, '/holidays/list')) && $method === 'GET') {
    require_once __DIR__ . '/controllers/HolidayController.php';
    $holidayController = new HolidayController();
    $holidayController->getAllHolidays();
    exit();
}
if ($method === 'POST' && in_array($path, ['api/auth/login', 'auth/login'], true)) {
    require_once __DIR__ . '/controllers/authController.php';
    $auth = new AuthController();
    $auth->login();
    exit();
}

if ($method === 'GET' && in_array($path, ['api/employees/list', 'employees/list'], true)) {
    require_once __DIR__ . '/config/db.php';
    $db = new Database();
    $pdo = $db->getConnection();
    $stmt = $pdo->query("SELECT id, employee_code, first_name, last_name, company_email, department_id, status FROM employees ORDER BY id DESC");
    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);
    http_response_code(200);
    echo json_encode($employees);
    exit();
}

if ($method === 'GET' && in_array($path, ['api/employees/profile', 'employees/profile'], true)) {
    require_once __DIR__ . '/config/db.php';
    $db = new Database();
    $pdo = $db->getConnection();
    $stmt = $pdo->query("SELECT id, employee_code, first_name, last_name, company_email, department_id, status FROM employees LIMIT 1");
    $employee = $stmt->fetch(PDO::FETCH_ASSOC);
    http_response_code(200);
    echo json_encode($employee ?: []);
    exit();
}

http_response_code(404);
echo json_encode(["message" => "Endpoint not found."]);