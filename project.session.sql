--@block
CREATE TABLE User (
    id INT PRIMARY KEY AUTO_INCREMENT,
    Mail VARCHAR(100),
    phone VARCHAR(10),
    Pass VARCHAR(255),
    user_type VARCHAR(20)
);

--@block
INSERT INTO User (Mail, phone, Pass, user_type)
VALUES 
    ('hello@gmail.com','0501234567','123456','job seeker'),
    ('yello@gmail.com','0501223523','123321','job seeker'),
    ('jello@gmail.com','0521266457','456654','job seeker'),
    ('mello@gmail.com','0501243567','789987','employer'),
    ('nello@gmail.com','0502134567','142536','employer'),
    ('zello@gmail.com','0501235467','748596','employer');

--@block
CREATE TABLE Jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    typ VARCHAR(10),
    wage INT,
    locat VARCHAR(100),
    publication_date DATE,
    descript TEXT
);

--@block
INSERT INTO Jobs (typ, wage, locat, publication_date, descript)
VALUES 
  ('full time', 35, '32.079477635067796, 34.768807222396305', '2025-01-12', 'מחפשים טבח/ית לצוות, למשרה מלאה בואו להצטרף לצוות שהוא כמו משפחה!!'),
  ('part time', 40, '32.079477635067796, 34.768807222396305', '2025-01-12', 'מחפשים מארחת לצוות, למשרה חלקית בואי להצטרף לצוות שהוא כמו משפחה!!'),
  ('full time', 60, '32.31410612776423, 34.84652411751194', '2025-01-20', 'מחפשים קונדיטור/ית לצוות, למשרה מלאה בואו להצטרף לצוות המלון !!'),
  ('full time', 45, '31.663223352552464, 34.55967862873611', '2025-01-14', 'מחפשים אח/ות למחלקת יולדות, למשרה מלאה.דרוש/ה אח/ות עם ניסיון והמלצות!!');

--@block
CREATE TABLE Applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT REFERENCES User(id),
    job_id INT REFERENCES Jobs(id),
    match_date DATE
);

--@block
INSERT INTO Applications (user_id, job_id, match_date)
VALUES 
  (1, 1, '2025-01-14'),
  (2, 2, '2025-01-13');

--@block
SELECT * FROM applications