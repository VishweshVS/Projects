<?php
// Prevent re-declaration crashes across the routing execution thread
if (!class_exists('Database')) {
    class Database {
        private $host = "localhost";
        private $db_name = "ems_db"; // Verified database target from your reset steps
        private $username = "root";
        private $password = "";
        public $conn;

        public function getConnection() {
            $this->conn = null;
            try {
                $this->conn = new PDO(
                    "mysql:host=" . $this->host . ";dbname=" . $this->db_name, 
                    $this->username, 
                    $this->password
                );
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch(PDOException $exception) {
                header('Content-Type: application/json');
                http_response_code(500);
                echo json_encode(["error" => "Connection failed: " . $exception->getMessage()]);
                exit();
            }
            return $this->conn;
        }
    }
}

// Automatically instantiate and bind to the global stream for the controllers
global $conn;
if (!isset($conn)) {
    $databaseInstance = new Database();
    $conn = $databaseInstance->getConnection();
}
?>