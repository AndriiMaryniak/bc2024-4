const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const superagent = require('superagent');

// Шлях до директорії кешу
const cacheDir = './cache';

// Переконайтесь, що директорія кешу існує
fs.mkdir(cacheDir, { recursive: true }).catch(err => console.error('Error creating cache directory:', err));

const fetchImageFromHttpCat = async (code) => {
    try {
        const response = await superagent.get(`https://http.cat/${code}`);
        return response.body; // Повертає картинку
    } catch (err) {
        throw new Error('Image not found on http.cat');
    }
};

const server = http.createServer(async (req, res) => {
    const code = req.url.substring(1); // Отримуємо код з URL (без слеша)
    const filePath = path.join(cacheDir, `${code}.jpg`);

    if (req.method === 'GET') {
        try {
            const data = await fs.readFile(filePath);
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(data);
        } catch (err) {
            // Якщо картинка не знайдена в кеші, намагаємось отримати її з http.cat
            try {
                const httpCatImage = await fetchImageFromHttpCat(code);
                await fs.writeFile(filePath, httpCatImage); // Зберігаємо в кеш
                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                res.end(httpCatImage);
            } catch (fetchError) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Image not found on http.cat.');
            }
        }
    } else if (req.method === 'PUT') {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', async () => {
            try {
                await fs.writeFile(filePath, Buffer.concat(chunks));
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Image cached successfully.' }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error saving the image.');
            }
        });
    } else if (req.method === 'DELETE') {
        try {
            await fs.unlink(filePath);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Image deleted successfully.');
        } catch (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Image not found.');
        }
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method not allowed.');
    }
});

// Запуск сервера
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
