DROP DATABASE IF EXISTS club_event_manager;
CREATE DATABASE club_event_manager;
USE club_event_manager;

CREATE TABLE student(
	regno			VARCHAR(9)			PRIMARY KEY,
	email			VARCHAR(50)			NOT NULL,
    password		VARCHAR(50)			NOT NULL,
    fname           VARCHAR(20)         NOT NULL,
    mname           VARCHAR(20),
    lname           VARCHAR(20)         NOT NULL,
    phno            VARCHAR(10)         NOT NULL,
    club            VARCHAR(40)
);

CREATE TABLE club(
	cname			VARCHAR(40)			PRIMARY KEY,
	email			VARCHAR(50)			NOT NULL,
    password		VARCHAR(50)			NOT NULL,
    phno            VARCHAR(10)         NOT NULL,
    logo            VARCHAR(255)
);

CREATE TABLE events(
    ID  INT PRIMARY KEY AUTO_INCREMENT ,
    ename varchar(100) NOT NULL,
    venue varchar(50) NOT NULL,
    edate DATE NOT NULL ,
    max_no_of_participant INT NOT NULL ,
    remarks TEXT NOT NULL,
    cname VARCHAR(40),
    poster VARCHAR(255) NOT NULL,
    FOREIGN KEY (cname) REFERENCES club(cname)
);

CREATE TABLE member_of(
    regno VARCHAR(9) NOT NULL ,
    cname VARCHAR(40) NOT NULL,
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
    years VARCHAR(7) NOT NULL,
    PRIMARY KEY (years,ID),
    FOREIGN KEY (ID) REFERENCES events(ID)
);
