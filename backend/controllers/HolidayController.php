<?php
require_once __DIR__ . '/../config/db.php';

class HolidayController {
    private $db;

    public function __construct() {
        global $conn; 
        if (isset($conn) && $conn !== null) {
            $this->db = $conn;
        } else {
            $database = new Database();
            $this->db = $database->getConnection();
        }
    }

    public function getAllHolidays() {
    // Handle Preflight OPTIONS requests cleanly before anything else executes
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header("Access-Control-Allow-Origin: http://localhost:5173");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
        header("Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With");
        http_response_code(200);
        exit();
    }

    // Standard headers for the final GET delivery
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With");
    header("Content-Type: application/json; charset=UTF-8");
        try {
            // Sort chronologically so it scales nicely over the calendar year
            $query = "SELECT id, holiday_name, holiday_date, holiday_type, description FROM holidays ORDER BY holiday_date ASC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $holidays = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (ob_get_length()) ob_clean();
            http_response_code(200);
            echo json_encode($holidays);
            exit();
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => "Could not retrieve holiday datasets.", "error" => $e->getMessage()]);
            exit();
        }
    }
}