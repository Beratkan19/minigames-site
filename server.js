const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('.')); // Statik dosyaları serve et

app.get('/api/status', (req, res) => {
    res.json({ status: 'running' });
});

app.get('/api/discord/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const response = await fetch(`https://discord.com/api/v9/users/${userId}`, {
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error(`Discord API Error: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
