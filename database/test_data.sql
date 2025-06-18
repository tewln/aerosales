
INSERT INTO aerosales.city (name, timezone) VALUES 
('Москва', 'Europe/Moscow'),
('Санкт-Петербург', 'Europe/Moscow'),
('Екатеринбург', 'Asia/Yekaterinburg'),
('Новосибирск', 'Asia/Novosibirsk'),
('Казань', 'Europe/Moscow'),
('Сочи', 'Europe/Moscow'),
('Владивосток', 'Asia/Vladivostok'),
('Красноярск', 'Asia/Krasnoyarsk'),
('Самара', 'Europe/Samara'),
('Челябинск', 'Asia/Yekaterinburg'),
('Уфа', 'Asia/Yekaterinburg'),
('Ростов-на-Дону', 'Europe/Moscow');

INSERT INTO aerosales.airline (name, logo_url) VALUES 
('Аэрофлот', '/uploads/airlines/aeroflot.png'),
('S7 Airlines', '/uploads/airlines/s7.png'),
('Уральские авиалинии', '/uploads/airlines/ural.png'),
('Россия', '/uploads/airlines/russia.png'),
('Ютэйр', '/uploads/airlines/utair.png'),
('Победа', '/uploads/airlines/pobeda.png'),
('Азимут', '/uploads/airlines/azimut.png'),
('Северный ветер', '/uploads/airlines/nordwind.png'),
('Red Wings', '/uploads/airlines/redwings.png'),
('Икар', '/uploads/airlines/ikar.png'),
('Ай Флай', '/uploads/airlines/ifly.png'),
('Ямал', '/uploads/airlines/yamal.png');

INSERT INTO aerosales.airport (city, name) VALUES 
(1, 'Домодедово'),
(1, 'Шереметьево'),
(1, 'Внуково'),
(2, 'Пулково'),
(3, 'Кольцово'),
(4, 'Толмачёво'),
(5, 'Казань'),
(6, 'Сочи'),
(7, 'Владивосток'),
(8, 'Емельяново'),
(9, 'Курумоч'),
(10, 'Баландино'),
(11, 'Уфа'),
(12, 'Платов');

DO $$
DECLARE
    user_id INTEGER;
BEGIN
    INSERT INTO aerosales."user" (surname, firstname, lastname, birth_date, role)
    VALUES ('Иванов', 'Иван', 'Иванович', '1990-01-15', 'user')
    RETURNING id INTO user_id;
    
    INSERT INTO aerosales.auth_data (user_id, login, password)
    VALUES (user_id, 'ivanov', '$argon2id$v=19$m=65536,t=3,p=4$salt$hash1');
    
    INSERT INTO aerosales.contact_detail (user_id, email, phone)
    VALUES (user_id, 'ivanov@mail.ru', '+79161234567');

    INSERT INTO aerosales."user" (surname, firstname, lastname, birth_date, role)
    VALUES ('Петров', 'Петр', 'Петрович', '1985-03-20', 'user')
    RETURNING id INTO user_id;
    
    INSERT INTO aerosales.auth_data (user_id, login, password)
    VALUES (user_id, 'petrov', '$argon2id$v=19$m=65536,t=3,p=4$salt$hash2');
    
    INSERT INTO aerosales.contact_detail (user_id, email, phone)
    VALUES (user_id, 'petrov@gmail.com', '+79267654321');

    INSERT INTO aerosales."user" (surname, firstname, lastname, birth_date, role)
    VALUES ('Сидорова', 'Анна', 'Викторовна', '1992-07-10', 'user')
    RETURNING id INTO user_id;
    
    INSERT INTO aerosales.auth_data (user_id, login, password)
    VALUES (user_id, 'sidorova', '$argon2id$v=19$m=65536,t=3,p=4$salt$hash3');
    
    INSERT INTO aerosales.contact_detail (user_id, email, phone)
    VALUES (user_id, 'anna.sidorova@yandex.ru', '+79031112233');

    INSERT INTO aerosales."user" (surname, firstname, lastname, birth_date, role)
    VALUES ('Смирнов', 'Сергей', 'Александрович', '1988-11-25', 'user')
    RETURNING id INTO user_id;
    
    INSERT INTO aerosales.auth_data (user_id, login, password)
    VALUES (user_id, 'smirnov', '$argon2id$v=19$m=65536,t=3,p=4$salt$hash4');
    
    INSERT INTO aerosales.contact_detail (user_id, email, phone)
    VALUES (user_id, 'smirnov.sergey@mail.ru', '+79041234567');

    INSERT INTO aerosales."user" (surname, firstname, lastname, birth_date, role)
    VALUES ('Кузнецова', 'Мария', 'Ивановна', '1994-02-14', 'user')
    RETURNING id INTO user_id;
    
    INSERT INTO aerosales.auth_data (user_id, login, password)
    VALUES (user_id, 'kuznetsova', '$argon2id$v=19$m=65536,t=3,p=4$salt$hash5');
    
    INSERT INTO aerosales.contact_detail (user_id, email, phone)
    VALUES (user_id, 'maria.k@gmail.com', '+79052345678');

    INSERT INTO aerosales."user" (surname, firstname, lastname, birth_date, role)
    VALUES ('Попов', 'Дмитрий', 'Николаевич', '1987-09-03', 'user')
    RETURNING id INTO user_id;
    
    INSERT INTO aerosales.auth_data (user_id, login, password)
    VALUES (user_id, 'popov', '$argon2id$v=19$m=65536,t=3,p=4$salt$hash6');
    
    INSERT INTO aerosales.contact_detail (user_id, email, phone)
    VALUES (user_id, 'dmitry.popov@yandex.ru', '+79063456789');

    INSERT INTO aerosales."user" (surname, firstname, lastname, birth_date, role)
    VALUES ('Васильева', 'Екатерина', 'Сергеевна', '1991-12-08', 'user')
    RETURNING id INTO user_id;
    
    INSERT INTO aerosales.auth_data (user_id, login, password)
    VALUES (user_id, 'vasilieva', '$argon2id$v=19$m=65536,t=3,p=4$salt$hash7');
    
    INSERT INTO aerosales.contact_detail (user_id, email, phone)
    VALUES (user_id, 'ekaterina.v@mail.ru', '+79074567890');

    INSERT INTO aerosales."user" (surname, firstname, lastname, birth_date, role)
    VALUES ('Михайлов', 'Алексей', 'Владимирович', '1989-04-17', 'user')
    RETURNING id INTO user_id;
    
    INSERT INTO aerosales.auth_data (user_id, login, password)
    VALUES (user_id, 'mihailov', '$argon2id$v=19$m=65536,t=3,p=4$salt$hash8');
    
    INSERT INTO aerosales.contact_detail (user_id, email, phone)
    VALUES (user_id, 'alex.mihailov@gmail.com', '+79085678901');

    INSERT INTO aerosales."user" (surname, firstname, lastname, birth_date, role)
    VALUES ('Новикова', 'Ольга', 'Андреевна', '1993-06-22', 'user')
    RETURNING id INTO user_id;
    
    INSERT INTO aerosales.auth_data (user_id, login, password)
    VALUES (user_id, 'novikova', '$argon2id$v=19$m=65536,t=3,p=4$salt$hash9');
    
    INSERT INTO aerosales.contact_detail (user_id, email, phone)
    VALUES (user_id, 'olga.novikova@yandex.ru', '+79096789012');

    INSERT INTO aerosales."user" (surname, firstname, lastname, birth_date, role)
    VALUES ('Федоров', 'Николай', 'Петрович', '1986-08-12', 'user')
    RETURNING id INTO user_id;
    
    INSERT INTO aerosales.auth_data (user_id, login, password)
    VALUES (user_id, 'fedorov', '$argon2id$v=19$m=65536,t=3,p=4$salt$hash10');
    
    INSERT INTO aerosales.contact_detail (user_id, email, phone)
    VALUES (user_id, 'nikolay.fedorov@mail.ru', '+79101234567');

    INSERT INTO aerosales."user" (surname, firstname, lastname, birth_date, role)
    VALUES ('Админов', 'Админ', 'Админович', '1980-01-01', 'admin')
    RETURNING id INTO user_id;
    
    INSERT INTO aerosales.auth_data (user_id, login, password)
    VALUES (user_id, 'admin', '$argon2id$v=19$m=65536,t=3,p=4$salt$adminHash');
    
    INSERT INTO aerosales.contact_detail (user_id, email, phone)
    VALUES (user_id, 'admin@aerosales.com', '+79991234567');
END $$;

INSERT INTO aerosales.trip (departure_airport, arrival_airport, departure_date, arrival_date, price, available_seats, airline) VALUES 
(1, 4, '2025-06-25 10:00:00+03', '2025-06-25 14:30:00+03', 15000.00, 150, 1),
(2, 8, '2025-06-26 08:00:00+03', '2025-06-26 10:45:00+03', 12000.00, 180, 2),
(3, 6, '2025-06-27 14:00:00+03', '2025-06-27 17:20:00+03', 8000.00, 120, 3),
(1, 9, '2025-06-28 16:00:00+03', '2025-06-28 23:45:00+03', 25000.00, 200, 1),
(5, 2, '2025-07-05 11:00:00+03', '2025-07-05 15:30:00+03', 18000.00, 160, 4),
(7, 3, '2025-07-10 09:00:00+03', '2025-07-10 12:15:00+03', 9500.00, 140, 5),
(9, 1, '2025-07-15 13:00:00+03', '2025-07-15 20:30:00+03', 22000.00, 170, 2),
(6, 10, '2025-07-20 12:00:00+03', '2025-07-20 15:45:00+03', 11000.00, 130, 6),
(8, 5, '2025-08-05 15:00:00+03', '2025-08-05 18:20:00+03', 13500.00, 165, 7),
(11, 12, '2025-08-10 07:30:00+03', '2025-08-10 09:50:00+03', 7500.00, 100, 8),
(12, 14, '2025-08-15 17:00:00+03', '2025-08-15 19:15:00+03', 9800.00, 145, 9),
(4, 7, '2025-08-20 06:00:00+03', '2025-08-20 11:30:00+03', 16500.00, 175, 10);

INSERT INTO aerosales.discount (trip_id, percentage, expires_at) VALUES 
(1, 15, '2025-08-15 23:59:59+03'),
(2, 10, '2025-08-20 23:59:59+03'),
(3, 20, '2025-08-25 23:59:59+03'),
(4, 25, '2025-08-30 23:59:59+03'),
(5, 12, '2025-09-05 23:59:59+03'),
(6, 18, '2025-09-10 23:59:59+03'),
(7, 22, '2025-09-15 23:59:59+03'),
(8, 8, '2025-09-20 23:59:59+03'),
(9, 30, '2025-09-25 23:59:59+03'),
(10, 5, '2025-09-30 23:59:59+03'),
(11, 14, '2025-10-05 23:59:59+03'),
(12, 17, '2025-10-10 23:59:59+03');

INSERT INTO aerosales.purchase (user_id, trip_id, number_of_seats, status) VALUES 
(1, 1, 2, 'paid'),
(2, 2, 1, 'paid'),
(3, 3, 3, 'paid'),
(4, 4, 1, 'paid'),
(5, 5, 2, 'paid'),
(6, 6, 1, 'paid'),
(7, 7, 2, 'paid'),
(8, 8, 1, 'paid'),
(9, 9, 4, 'paid'),
(10, 10, 1, 'paid'),
(1, 11, 1, 'paid'),
(2, 12, 2, 'paid'),
(3, 1, 1, 'canceled'),
(4, 2, 2, 'paid'),
(5, 3, 1, 'paid'),
(6, 4, 3, 'paid'),
(7, 5, 1, 'paid'),
(8, 6, 2, 'paid'),
(9, 7, 1, 'paid'),
(10, 8, 1, 'paid'),
(1, 9, 2, 'paid'),
(2, 10, 1, 'paid'),
(3, 11, 1, 'paid'),
(4, 12, 2, 'paid'),
(5, 1, 1, 'paid'),
(6, 2, 1, 'paid'),
(7, 3, 3, 'paid'),
(8, 4, 1, 'paid'),
(9, 5, 2, 'paid'),
(10, 6, 1, 'paid');

INSERT INTO aerosales.favorite (user_id, trip_id) VALUES 
(1, 1), (1, 2), (1, 3),
(2, 2), (2, 3), (2, 4),
(3, 3), (3, 4), (3, 5),
(4, 4), (4, 5), (4, 6),
(5, 5), (5, 6), (5, 7),
(6, 6), (6, 7), (6, 8),
(7, 7), (7, 8), (7, 9),
(8, 8), (8, 9), (8, 10),
(9, 9), (9, 10), (9, 11),
(10, 10), (10, 11), (10, 12);

INSERT INTO aerosales.review (user_id, trip_id, rating, comment) VALUES 
(1, 1, 5, 'Отличный рейс! Все было на высшем уровне.'),
(2, 2, 4, 'Хорошо, но небольшая задержка при посадке.'),
(3, 3, 5, 'Превосходное обслуживание, рекомендую!'),
(4, 4, 3, 'Нормально, но могло быть лучше.'),
(5, 5, 4, 'Приятный полет, вежливый персонал.'),
(6, 6, 5, 'Все прошло идеально, спасибо!'),
(7, 7, 4, 'Хорошая авиакомпания, буду летать еще.'),
(8, 8, 2, 'Были проблемы с багажом, не очень довольна.'),
(9, 9, 5, 'Замечательный сервис, комфортные кресла.'),
(10, 10, 4, 'В целом хорошо, небольшие замечания по питанию.'),
(1, 11, 5, 'Быстро и комфортно добрались до места назначения.'),
(2, 12, 4, 'Приемлемые цены, качественное обслуживание.');