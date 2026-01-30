const { Client, GatewayIntentBits } = require('discord.js');

// 1. CAPTURAR EL TOKEN
// El server.js envía el token como el tercer argumento (index 2)
const token = process.argv[2];

if (!token) {
    console.error("❌ ERROR: No se recibió ningún token para iniciar el bot.");
    process.exit(1);
}

// 2. CONFIGURAR INTENTS
// Es vital que estos coincidan con lo que activaste en el Discord Developer Portal
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// 3. EVENTO CUANDO EL BOT SE ENCIENDE
client.once('ready', () => {
    console.log(`✅ ¡Bot encendido correctamente! Identificado como: ${client.user.tag}`);
});

// 4. EJEMPLO DE COMANDO SIMPLE
client.on('messageCreate', (message) => {
    if (message.content === '!ping') {
        message.reply('¡Pong! 🏓 El bot está funcionando desde Koyeb.');
    }
});

// 5. LOGIN
client.login(token).catch(err => {
    console.error("❌ ERROR DE LOGIN EN DISCORD:");
    if (err.message.includes("Privileged intent")) {
        console.error("Debes activar los 'Intents' en el Discord Developer Portal (Sección Bot).");
    } else {
        console.error(err);
    }
    process.exit(1);
});
