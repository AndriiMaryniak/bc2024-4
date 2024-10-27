const http = require('http');
const { program } = require('commander');
const fs = require('fs');
const path = require('path');

// Налаштування командного рядка з обов'язковими параметрами
program
  .requiredOption('-h, --host <host>', 'Адреса сервера')
  .requiredOption('-p, --port <port>', 'Порт сервера')
  .requiredOption('-c, --cache <cacheDir>', 'Шлях до кешованих файлів');

program.parse(process.argv);
const options = program.opts();

// Перевірка, чи існує директорія для кешу
if (!fs.existsSync(options.cache)) {
  console.error(`Помилка: Директорія ${options.cache} не існує`);
  process.exit(1);
}

// Створення веб-сервера
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Proxy server is running');
});

// Запуск сервера на заданому хості та порту
server.listen(options.port, options.host, () => {
  console.log(`Server is running at http://${options.host}:${options.port}`);
});


