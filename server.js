const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();

// IMPORTANTE: Koyeb espera el puerto 8000 según tus logs
const port = process.env.PORT || 8000; 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let runningBots = {};

// Ruta principal
app.get('/', (req, res) => {
    res.render('index', { bots: Object.keys(runningBots) });
});

// Ruta para lanzar bots
app.post('/launch', (req, res) => {
    const { botName, token } = req.body;

    if (runningBots[botName]) {
        return res.send('Este bot ya está corriendo.');
    }

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

// El '0.0.0.0' es vital para que Koyeb detecte que la app está viva
app.listen(port, "0.0.0.0", () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 PANEL ONLINE EN PUERTO: ${port}`);
    console.log(`-----------------------------------------`);
});
