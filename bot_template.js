const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const token = process.env.BOT_TOKEN;

client.on('ready', () => {
    console.log(`Bot iniciado como ${client.user.tag}`);
});

client.login(token);