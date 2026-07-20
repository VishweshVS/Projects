<?php
require_once __DIR__ . '/../config/db.php';

if (file_exists(__DIR__ . '/../../vendor/autoload.php')) {
    require_once __DIR__ . '/../../vendor/autoload.php';
}

use \Firebase\JWT\JWT;

class AuthController {
    private $db;
    private $jwt_secret = "YOUR_SUPER_SECRET_KEY_12345"; // Change this to a secure key string

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function login() {
        // Read raw JSON post data sent by React Axios payload
        $data = json_decode(file_get_contents("php://input"));

        // 1. Validations: Ensure fields are not empty
        if (empty($data->email) || empty($data->password)) {
            http_response_code(400);
            echo json_encode(["message" => "Email and Password cannot be empty."]);
            return;
        }

        $email = trim($data->email);
        $password = $data->password;

        // Validation: Verify standard email structure formatting
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid Email Address."]);
            return;
        }

        try {
            // 2. Fetch active employee and corresponding user details matching credentials
            $query = "SELECT u.id, u.password_hash, u.role, u.status as user_status, e.id as employee_id, e.status as emp_status 
                      FROM users u 
                      JOIN employees e ON u.employee_id = e.id 
                      WHERE u.email = :email LIMIT 1";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                http_response_code(401);
                echo json_encode(["message" => "User Not Found."]);
                return;
            }

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // 3. Business Rule Validation: Check status parameters
            if ($user['user_status'] === 'Inactive' || $user['emp_status'] === 'Inactive' || $user['emp_status'] === 'Terminated') {
                http_response_code(403);
                echo json_encode(["message" => "Account Disabled."]);
                return;
            }

            // 4. Verify password against encrypted database hash value
            if (!password_verify($password, $user['password_hash'])) {
                http_response_code(401);
                echo json_encode(["message" => "Incorrect Password."]);
                return;
            }

            // 5. Business Rules: Log tracking details and update last login timestamp
            $update_query = "UPDATE users SET last_login = NOW() WHERE id = :id";
            $update_stmt = $this->db->prepare($update_query);
            $update_stmt->bindParam(':id', $user['id']);
            $update_stmt->execute();

            // 6. Generate state Payload and issue secure signed JWT
            $issued_at = time();
            $expiration_time = $issued_at + (30 * 60); // Standard 30-minute expiration context rule from SRS
            
            $payload = [
                "iss" => "http://localhost/ems",
                "iat" => $issued_at,
                "exp" => $expiration_time,
                "data" => [
                    "user_id" => $user['id'],
                    "employee_id" => $user['employee_id'],
                    "role" => $user['role']
                ]
            ];

            $jwt = null;
            if (class_exists('Firebase\\JWT\\JWT')) {
                $jwt = \Firebase\JWT\JWT::encode($payload, $this->jwt_secret, 'HS256');
            }

            if (!$jwt) {
                $jwt = base64_encode(json_encode([
                    'role' => $user['role'],
                    'email' => $email,
                    'exp' => $expiration_time,
                    'user_id' => $user['id']
                ]));
            }

            // Respond with Success signature package and the operational token
            http_response_code(200);
            echo json_encode([
                "message" => "Login Successful.",
                "token" => $jwt,
                "expire_at" => $expiration_time,
                "user" => [
                    "role" => $user['role'],
                    "email" => $email
                ]
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => "An error occurred during authentication processing.", "error" => $e->getMessage()]);
        }
    }
}