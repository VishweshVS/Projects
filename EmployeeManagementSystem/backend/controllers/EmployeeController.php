<?php
require_once __DIR__ . '/../config/db.php';
require_once dirname(__DIR__) . '/vendor/autoload.php';
use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

class EmployeeController {
    private $db;
    private $jwt_secret = "YOUR_SUPER_SECRET_KEY_12345_SECURE_KEY_JWT";
    // 🛡️ NEW ACCESS CONTROL LAYER: Allows Admin, Super Admin, and HR
    private function validateHROrAdminAccess() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
            http_response_code(401);
            echo json_encode(["message" => "Access Denied. Missing authentication token."]);
            exit();
        }

        try {
            $token = str_replace('Bearer ', '', $authHeader);
            $decoded = JWT::decode($token, new Key($this->jwt_secret, 'HS256'));
            $userRole = isset($decoded->data->role) ? strtolower(trim($decoded->data->role)) : '';

            // Grant access to admin roles AND HR specialists
            if ($userRole !== 'admin' && $userRole !== 'super admin' && $userRole !== 'hr') {
                http_response_code(403);
                echo json_encode(["message" => "Forbidden. Insufficient system rights."]);
                exit();
            }
            return $decoded;
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(["message" => "Session expired or invalid signature.", "error" => $e->getMessage()]);
            exit();
        }
    }
    public function __construct() {
        // Force load the configuration if it hasn't been loaded yet
        $dbPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'db.php';
        if (file_exists($dbPath)) {
            require_once $dbPath;
        }

        // Pull the instantiated connection from global scope
        global $conn; 
        
        if (isset($conn) && $conn !== null) {
            $this->db = $conn;
        } else {
            header("Content-Type: application/json");
            http_response_code(500);
            echo json_encode(["message" => "Database connection instance not found inside Controller initialization scope."]);
            exit();
        }
    }
    // 5. SELF-SERVICE: FETCH LOGGED-IN EMPLOYEE'S OWN PROFILE
    public function getSelfProfile() {
        header("Access-Control-Allow-Origin: http://localhost:5173");
        header("Access-Control-Allow-Headers: Authorization, Content-Type");
        header("Content-Type: application/json; charset=UTF-8");

        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
            http_response_code(401);
            echo json_encode(["message" => "Access Denied."]);
            exit();
        }

        try {
            $token = str_replace('Bearer ', '', $authHeader);
            $decoded = JWT::decode($token, new Key($this->jwt_secret, 'HS256'));
            
            // Extract the unique user/employee ID embedded in your login JWT token payload
            $employeeId = $decoded->data->id ?? null; 

            if (!$employeeId) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid token payload mapping structure."]);
                exit();
            }

            // Query only this specific employee's complete details
            $query = "SELECT id, employee_code, first_name, last_name, company_email, personal_email, joining_date, status 
                      FROM employees WHERE id = :id LIMIT 1";
                      
            $stmt = $this->db->prepare($query);
            $stmt->execute([':id' => $employeeId]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$profile) {
                http_response_code(404);
                echo json_encode(["message" => "Profile metrics record not found."]);
                exit();
            }

            if (ob_get_length()) ob_clean();
            http_response_code(200);
            echo json_encode($profile);
            exit();

        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(["message" => "Session expired.", "error" => $e->getMessage()]);
            exit();
        }
    }

    // Helper method to validate administrative access tokens cleanly across operations
    private function validateAdminAccess() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
            http_response_code(401);
            echo json_encode(["message" => "Access Denied. Missing authentication token."]);
            exit();
        }

        try {
            $token = str_replace('Bearer ', '', $authHeader);
            $decoded = JWT::decode($token, new Key($this->jwt_secret, 'HS256'));
            $userRole = isset($decoded->data->role) ? strtolower(trim($decoded->data->role)) : '';

            if ($userRole !== 'admin' && $userRole !== 'super admin') {
                http_response_code(403);
                echo json_encode(["message" => "Forbidden. Insufficient system rights."]);
                exit();
            }
            return $decoded;
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(["message" => "Session expired or invalid signature.", "error" => $e->getMessage()]);
            exit();
        }
    }

    // 1. GET ALL EMPLOYEES
    public function getAllEmployees() {
        header("Access-Control-Allow-Origin: http://localhost:5173");
        header("Access-Control-Allow-Headers: Authorization, Content-Type");
        header("Content-Type: application/json; charset=UTF-8");

        $this->validateAdminAccess();

        $query = "SELECT id, employee_code, first_name, last_name, company_email, department_id, status FROM employees";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (ob_get_length()) ob_clean();
        http_response_code(200);
        echo json_encode($employees);
        exit();
    }

    // 2. CREATE NEW EMPLOYEE PROFILE RECORD
    public function createEmployee() {
        header("Access-Control-Allow-Origin: http://localhost:5173");
        header("Access-Control-Allow-Headers: Authorization, Content-Type");
        header("Content-Type: application/json; charset=UTF-8");

        $this->validateAdminAccess();
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['employee_code']) || empty($data['first_name']) || empty($data['last_name'])) {
            http_response_code(400);
            echo json_encode(["message" => "Incomplete parameters. Required fields missing."]);
            return;
        }

        // 1. Inside your parameter verification check, add a password default fallback
        $plainPassword = $data['password'] ?? 'Welcome@123'; // Default fallback password if none provided

        // 2. Hash the password before placing it into the statement parameters array
        $hashedPassword = password_hash($plainPassword, PASSWORD_BCRYPT);

        // 3. Update your SQL INSERT statement to map the new field
        $query = "INSERT INTO employees (
                    employee_code, first_name, last_name, personal_email, 
                    company_email, password, joining_date, department_id, designation_id, status
                ) VALUES (
                    :employee_code, :first_name, :last_name, :personal_email, 
                    :company_email, :password, :joining_date, :department_id, :designation_id, :status
                )";

        $stmt = $this->db->prepare($query);

        // 4. Feed the hashed variant securely into the execution mapper array
        $stmt->execute([
            ':employee_code'  => $data['employee_code'],
            ':first_name'     => $data['first_name'],
            ':last_name'      => $data['last_name'],
            ':personal_email' => $data['personal_email'] ?? null,
            ':company_email'  => $data['company_email'],
            ':password'       => $hashedPassword, // Saved safely as a secure hash string!
            ':joining_date'   => $data['joining_date'] ?? date('Y-m-d'),
            ':department_id'  => $data['department_id'] ?? 1,
            ':designation_id' => $data['designation_id'] ?? 1,
            ':status'         => $data['status'] ?? 'Active'
        ]);

        if (ob_get_length()) ob_clean();
        http_response_code(201);
        echo json_encode(["message" => "Employee entry created successfully!"]);
        exit();
    }

    // 3. UPDATE EMPLOYEE DATA PROFILE
    public function updateEmployee($id) {
        header("Access-Control-Allow-Origin: http://localhost:5173");
        header("Access-Control-Allow-Headers: Authorization, Content-Type");
        header("Access-Control-Allow-Methods: POST");
        header("Content-Type: application/json; charset=UTF-8");

        $this->validateAdminAccess();
        $data = json_decode(file_get_contents("php://input"), true);

        $query = "UPDATE employees SET first_name = :first_name, last_name = :last_name, company_email = :company_email, status = :status WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            ':first_name'    => $data['first_name'],
            ':last_name'     => $data['last_name'],
            ':company_email' => $data['company_email'],
            ':status'        => $data['status'],
            ':id'            => $id
        ]);

        if (ob_get_length()) ob_clean();
        http_response_code(200);
        echo json_encode(["message" => "Employee updated successfully."]);
        exit();
    }

    // 4. DELETE/REMOVE AN EMPLOYEE PROFILE RECORD
    public function deleteEmployee($id) {
        header("Access-Control-Allow-Origin: http://localhost:5173");
        header("Access-Control-Allow-Headers: Authorization, Content-Type");
        header("Access-Control-Allow-Methods: DELETE");
        header("Content-Type: application/json; charset=UTF-8");

        $this->validateAdminAccess();

        $query = "DELETE FROM employees WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->execute([':id' => $id]);

        if (ob_get_length()) ob_clean();
        http_response_code(200);
        echo json_encode(["message" => "Employee removed from database registration repository."]);
        exit();
    }
    // 5. HR MANAGEMENT COMPLIANCE: PATCH/PUT UPDATE STATUS ALONE
    public function updateStatus($id) {
        header("Access-Control-Allow-Origin: http://localhost:5173");
        header("Access-Control-Allow-Headers: Authorization, Content-Type");
        header("Access-Control-Allow-Methods: PUT, POST, OPTIONS");
        header("Content-Type: application/json; charset=UTF-8");

        // Protected view layer access checking
        $this->validateHROrAdminAccess();
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['status'])) {
            http_response_code(400);
            echo json_encode(["message" => "Status value tracking variable missing."]);
            return;
        }

        $query = "UPDATE employees SET status = :status WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            ':status' => $data['status'],
            ':id'     => $id
        ]);

        if (ob_get_length()) ob_clean();
        http_response_code(200);
        echo json_encode(["message" => "Employee status updated cleanly."]);
        exit();
    }
}