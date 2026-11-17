-- 1. SELECT + WHERE: Показать игроков с балансом больше 2000 тг
SELECT nickname, rank, balance
FROM players
WHERE balance > 2000;

-- 2. ORDER BY: Отсортировать всех игроков по убыванию баланса
SELECT id, nickname, rank, balance
FROM players
ORDER BY balance DESC;

-- 3. INNER JOIN: Вывести список игроков вместе с зоной и тарифом их компьютера
SELECT players.id, players.nickname, players.rank, players.balance, pcs.zone, pcs.hourly_rate
FROM players
INNER JOIN pcs ON players.pc_id = pcs.id;

-- 4. COUNT + GROUP BY: Посчитать количество игроков в каждой зоне клуба
SELECT pcs.zone, COUNT(players.id) AS total_players
FROM pcs
LEFT JOIN players ON pcs.id = players.pc_id
GROUP BY pcs.zone
ORDER BY total_players DESC;

-- 5. Запрос по выбору (ILIKE): Найти игроков по части никнейма без учёта регистра
SELECT id, nickname, rank, balance
FROM players
WHERE nickname ILIKE '%pro%';