-- Скрипт создания и заполнения базы данных для проекта CyberArena

CREATE TABLE pcs (
    id SERIAL PRIMARY KEY,
    zone VARCHAR(50) NOT NULL,
    hourly_rate INT NOT NULL
);

CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    rank VARCHAR(50) NOT NULL,
    balance INT NOT NULL DEFAULT 0,
    pc_id INT REFERENCES pcs(id)
);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    player_id INT REFERENCES players(id),
    hours_played INT NOT NULL,
    session_date DATE NOT NULL
);

INSERT INTO pcs (zone, hourly_rate) VALUES
('Standard', 800),
('Standard', 800),
('VIP', 1500),
('VIP', 1500),
('Bootcamp', 2000),
('Bootcamp', 2000);

INSERT INTO players (nickname, rank, balance, pc_id) VALUES
('s1mple_kz', 'Global Elite', 4500, 5),
('Nagibator228', 'Silver', 1200, 1),
('ShadowFiend', 'Immortal', 6000, 3),
('AwpGod', 'Legendary Eagle', 3200, 4),
('NoobMaster', 'Gold Nova', 500, 2),
('ProGamer_Pro', 'Divine', 2800, 6),
('KiberKotleta', 'Global Elite', 1900, 3);

INSERT INTO sessions (player_id, hours_played, session_date) VALUES
(1, 5, '2026-11-10'),
(2, 2, '2026-11-11'),
(3, 6, '2026-11-12'),
(1, 3, '2026-11-13'),
(4, 4, '2026-11-14'),
(5, 1, '2026-11-15'),
(6, 5, '2026-11-16'),
(7, 3, '2026-11-17');