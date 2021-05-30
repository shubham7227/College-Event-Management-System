DROP DATABASE IF EXISTS clubeventmanager;
CREATE DATABASE clubeventmanager;
USE clubeventmanager;
CREATE TABLE club(
	cname			VARCHAR(40)			PRIMARY KEY,
	email			VARCHAR(50)			NOT NULL,
    password		VARCHAR(50)			NOT NULL,
    phno            VARCHAR(10)         NOT NULL,
    logo            VARCHAR(255)
);


CREATE TABLE student(
	regno			VARCHAR(9)			PRIMARY KEY,
	email			VARCHAR(50)			NOT NULL,
    password		VARCHAR(50)			NOT NULL,
    fname           VARCHAR(20)         NOT NULL,
    mname           VARCHAR(20),
    lname           VARCHAR(20)         NOT NULL,
    phno            VARCHAR(10)         NOT NULL,
    syear           VARCHAR(2)          NOT NULL,
    sbranch         VARCHAR(3)          NOT NULL,
    photo           VARCHAR(255)        NOT NULL,
    cname           VARCHAR(40),
    FOREIGN KEY (cname) REFERENCES club(cname)
);

CREATE TABLE events(
    ID  INT PRIMARY KEY AUTO_INCREMENT ,
    ename varchar(100) NOT NULL,
    venue varchar(50) NOT NULL,
    edate DATE NOT NULL ,
    max_no_of_participant INT NOT NULL ,
    total_participant INT NOT NULL,
    remarks TEXT NOT NULL,
    cname VARCHAR(40),
    poster VARCHAR(255) NOT NULL,
    FOREIGN KEY (cname) REFERENCES club(cname)
);

CREATE TABLE has_member(
    regno VARCHAR(9) NOT NULL ,
    cname VARCHAR(40) NOT NULL,
    designation VARCHAR(20) NOT NULL,
    domain VARCHAR(20) NOT NULL,
    PRIMARY KEY (regno,cname),
    FOREIGN KEY (cname) REFERENCES club(cname),
    FOREIGN KEY (regno) REFERENCES student(regno)
);

CREATE TABLE participates(
    regno VARCHAR(9) NOT NULL,
    ID INT NOT NULL,
    PRIMARY KEY (regno,ID),
    FOREIGN KEY (regno) REFERENCES student(regno),
    FOREIGN KEY (ID) REFERENCES events(ID)
);

CREATE table branch(
    ID INT NOT NULL,
    branches VARCHAR(3) NOT NULL,
    PRIMARY KEY (branches,ID),
    FOREIGN KEY (ID) REFERENCES events(ID)
);

CREATE table year(
    ID INT NOT NULL,
    years VARCHAR(2) NOT NULL,
    PRIMARY KEY (years,ID),
    FOREIGN KEY (ID) REFERENCES events(ID)
);

DELIMITER //
CREATE FUNCTION extractyear(reg_no VARCHAR(9))
RETURNS VARCHAR(2)
DETERMINISTIC
BEGIN
    DECLARE temp_year VARCHAR(2);
    SET temp_year = SUBSTRING(reg_no,1,2);
    RETURN (temp_year);
END //
DELIMITER ;

DELIMITER //

CREATE TRIGGER findyear
BEFORE INSERT ON student FOR EACH ROW
BEGIN
    SET NEW.syear = extractyear(new.regno);
END //   

DELIMITER ;


DELIMITER //
CREATE FUNCTION extractbranch(reg_no VARCHAR(9))
RETURNS VARCHAR(3)
DETERMINISTIC
BEGIN
    DECLARE temp_branch VARCHAR(3);
    SET temp_branch = UPPER(SUBSTRING(reg_no,3,3));
    RETURN (temp_branch);
END //
DELIMITER ;

DELIMITER //

CREATE TRIGGER findbranch
    BEFORE INSERT
    ON student FOR EACH ROW
BEGIN
    SET NEW.sbranch = extractbranch(new.regno);
END //    

DELIMITER ;


DELIMITER //
CREATE FUNCTION cap_regno(reg_no VARCHAR(9))
RETURNS VARCHAR(9)
DETERMINISTIC
BEGIN
    DECLARE temp_regno VARCHAR(9);
    SET temp_regno = UPPER(reg_no);
    RETURN (temp_regno);
END //
DELIMITER ;

DELIMITER //

CREATE TRIGGER cap_reg
    BEFORE INSERT
    ON student FOR EACH ROW
BEGIN
    SET NEW.regno = cap_regno(new.regno);
END //    

DELIMITER ;