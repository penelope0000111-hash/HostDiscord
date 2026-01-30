const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();

// Usamos el puerto 8000 para Koyeb
const port = process.env.PORT || 8000; 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let runningBots = {};

app.get('/', (req, res) => {
    res.render('index', { bots: Object.keys(runningBots) });
});

// Cambiamos el nombre de la ruta a /add-bot para que coincida con tu error
app.post('/add-bot', (req, res) => {
    const { botName, token } = req.body;

    if (runningBots[botName]) {
        return res.send('Este bot ya está corriendo.');
    }

    // Lanza el proceso del bot
    const botProcess = spawn('node', ['bot_template.js', token]);

    botProcess.stdout.on('data', (data) => {
        console.log(`[${botName}]: ${data}`);
    });

    botProcess.stderr.on('data', (data) => {
        console.error(`[${botName} ERROR]: ${data}`);
    });

    runningBots[botName] = botProcess;
    res.redirect('/');
});

app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Panel Online en el puerto: ${port}`);
});
