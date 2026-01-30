const express = require('express');
const pm2 = require('pm2');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Página principal: Lista de bots
app.get('/', (req, res) => {
    pm2.list((err, list) => {
        res.render('index', { bots: list });
    });
});

// Ruta para añadir un nuevo bot por Token
app.post('/add-bot', (req, res) => {
    const { name, token } = req.body;
    
    // Aquí lanzamos un script genérico pasando el token como variable de entorno
    pm2.start({
        script: 'bot_template.js',
        name: name,
        env: { BOT_TOKEN: token }
    }, (err) => {
        res.redirect('/');
    });
});

app.listen(3000, () => console.log("Panel privado en http://localhost:3000"));