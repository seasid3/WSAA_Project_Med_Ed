CREATE DATABASE IF NOT EXISTS rcppi_bst;
USE rcppi_bst;

CREATE TABLE IF NOT EXISTS bst_applicants (
    rcppi_id     INT AUTO_INCREMENT PRIMARY KEY,
    first_name   VARCHAR(50)  NOT NULL,
    surname      VARCHAR(50)  NOT NULL,
    dob          DATE         NOT NULL,
    bst_scheme   ENUM('Obstetrics and Gynaecology','Histopathology','General Internal Medicine','Paediatrics') NOT NULL,
    interview_score DECIMAL(5,2) DEFAULT NULL,
    place_offered   TINYINT(1)   DEFAULT NULL,
    acceptance      ENUM('accepted','refused') DEFAULT NULL
);
