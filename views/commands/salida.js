const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { formatoFecha, formatoCorto } = require("../utils/fecha");
const ROLES = require("../utils/roles");

const DATA_FILE = path.join(__dirname, "..", "fichajes.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("salida")
    .setDescription("Registrar tu hora de salida (solo PSG)."),
  async execute(interaction) {
    const member = interaction.member;
    if (!member.roles.cache.has(ROLES.PSG)) {
      return interaction.reply({ content: "❌ No tenés permiso. Solo PSG puede usar este comando.", ephemeral: true });
    }

    // Cargar datos
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const fichajes = raw ? JSON.parse(raw) : {};

    const uid = interaction.user.id;
    if (!fichajes[uid] || !fichajes[uid].entrada) {
      return interaction.reply({ content: "❌ No tenés ninguna entrada abierta.", ephemeral: true });
    }

    const entrada = new Date(fichajes[uid].entrada);
    const ahora = new Date();

    const diffSec = Math.floor((ahora - entrada) / 1000);
    const horas = Math.floor(diffSec / 3600);
    const minutos = Math.floor((diffSec % 3600) / 60);
    const segundos = diffSec % 60;
    const totalMinutos = Math.floor(diffSec / 60);

    fichajes[uid].totalMinutos = (fichajes[uid].totalMinutos || 0) + totalMinutos;
    fichajes[uid].cantidad = (fichajes[uid].cantidad || 0) + 1;
    delete fichajes[uid].entrada;

    fs.writeFileSync(DATA_FILE, JSON.stringify(fichajes, null, 4));

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("📤 Salida registrada")
      .setDescription("Tu hora de salida fue registrada correctamente.")
      .addFields(
        { name: "🕒 Fecha y hora de salida:", value: formatoFecha(ahora) },
        { name: "⏱️ Tiempo total fichado:", value: `${horas}h ${minutos}m ${segundos}s` },
        { name: "🕒 Minutos totales:", value: `${totalMinutos} min` },
        { name: "Sistema de fichajes •", value: formatoCorto(ahora) }
      );

    await interaction.reply({ embeds: [embed] });

    // Log
    try {
      const logger = require("../utils/logger");
      await logger(interaction.client, `🔴 Salida: <@${uid}> • PSG: <@${interaction.user.id}> • Tiempo: ${horas}h ${minutos}m ${segundos}s • ${formatoCorto(ahora)}`);
    } catch {}
  }
};