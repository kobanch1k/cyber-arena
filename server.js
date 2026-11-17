require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = process.env.DATABASE_URL
    ? new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
      })
    : new Pool({
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME,
      });

pool.query('SELECT NOW()', (err) => {
    if (err) {
        console.error('❌ ОШИБКА ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ:', err.message);
    } else {
        console.log('✅ Успешное подключение к PostgreSQL');
    }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/players', async (req, res) => {
    try {
        const { search = '', sort = 'id', zone = 'all', minBalance = 0 } = req.query;

        let orderBy = 'players.id ASC';
        if (sort === 'balance_desc') orderBy = 'players.balance DESC';
        if (sort === 'balance_asc') orderBy = 'players.balance ASC';
        if (sort === 'nick_asc') orderBy = 'players.nickname ASC';

        let conditions = ['players.nickname ILIKE $1', 'players.balance >= $2'];
        let params = [`%${search}%`, Number(minBalance) || 0];

        if (zone !== 'all') {
            params.push(zone);
            conditions.push(`pcs.zone = $${params.length}`);
        }

        const query = `
            SELECT players.id, players.nickname, players.rank, players.balance, players.pc_id,
                   pcs.zone, pcs.hourly_rate
            FROM players
            INNER JOIN pcs ON players.pc_id = pcs.id
            WHERE ${conditions.join(' AND ')}
            ORDER BY ${orderBy}
        `;
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка БД: ' + err.message });
    }
});

app.get('/api/pcs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pcs ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка загрузки ПК: ' + err.message });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const query = `
            SELECT pcs.zone, COUNT(players.id) AS player_count
            FROM pcs
            LEFT JOIN players ON pcs.id = players.pc_id
            GROUP BY pcs.zone
            ORDER BY player_count DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка статистики: ' + err.message });
    }
});

app.post('/api/players', async (req, res) => {
    try {
        const { nickname, rank, balance, pc_id } = req.body;
        if (!nickname || !rank || balance === undefined || !pc_id) {
            return res.status(400).json({ error: 'Заполните все поля формы!' });
        }

        const query = `
            INSERT INTO players (nickname, rank, balance, pc_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await pool.query(query, [nickname.trim(), rank.trim(), Number(balance), Number(pc_id)]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка добавления: ' + err.message });
    }
});

app.put('/api/players/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nickname, rank, balance, pc_id } = req.body;
        if (!nickname || !rank || balance === undefined || !pc_id) {
            return res.status(400).json({ error: 'Все поля обязательны!' });
        }

        const query = `
            UPDATE players
            SET nickname = $1, rank = $2, balance = $3, pc_id = $4
            WHERE id = $5
            RETURNING *
        `;
        const result = await pool.query(query, [nickname.trim(), rank.trim(), Number(balance), Number(pc_id), id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Игрок не найден' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка обновления: ' + err.message });
    }
});

app.delete('/api/players/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM players WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Игрок не найден' });
        res.json({ message: 'Игрок удалён из базы клуба' });
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({
                error: 'Нельзя удалить игрока: за ним числятся завершённые игровые сессии!'
            });
        }
        res.status(500).json({ error: 'Ошибка удаления: ' + err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер CyberArena запущен на порту ${PORT}`);
});
