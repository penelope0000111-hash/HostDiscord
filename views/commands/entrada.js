  const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { formatoFecha, formatoCorto } = require("../utils/fecha");
const ROLES = require("../utils/roles");

const DATA_FILE = path.join(__dirname, "..", "fichajes.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("entrada")
    .setDescription("Registrar tu hora de entrada (solo PSG)."),
  async execute(interaction) {
    const member = interaction.member;
    if (!member.roles.cache.has(ROLES.PSG)) {
    return interaction.reply({
    content: "❌ No tenés permiso. Solo PSG puede usar este comando.",
    ephemeral: true
  });
}

    // Cargar datos
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const fichajes = raw ? JSON.parse(raw) : {};

    const uid = interaction.user.id;
    if (fichajes[uid] && fichajes[uid].entrada) {
      return interaction.reply({ content: "❌ Ya tenés una entrada abierta.", ephemeral: true });
    }

    const ahora = new Date();
    if (!fichajes[uid]) fichajes[uid] = { totalMinutos: 0, cantidad: 0 };
    fichajes[uid].entrada = ahora.toISOString();

    fs.writeFileSync(DATA_FILE, JSON.stringify(fichajes, null, 4));

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("📥 Entrada registrada")
      .setDescription("Tu hora de entrada fue registrada correctamente.")
      .addFields(
        { name: "🕒 Fecha y hora:", value: formatoFecha(ahora) },
        { name: "Sistema de fichajes", value: formatoCorto(ahora) }
      );

    await interaction.reply({ embeds: [embed] });

    // Log simple (no bloqueo si falla)
    try {
      const logger = require("../utils/logger");
      await logger(interaction.client, `🟢 Entrada: <@${uid}> • PSG: <@${interaction.user.id}> • ${formatoCorto(ahora)}`);
    } catch {}
  }
};