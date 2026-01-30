const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { formatoCorto } = require("../utils/fecha");
const ROLES = require("../utils/roles");

const DATA_FILE = path.join(__dirname, "..", "fichajes.json");

// Roles permitidos para usar /restartiempo
const HIGH_ROLES = [
  ROLES.DUEÑO,
  ROLES.CO_DUEÑO,
  ROLES.HEAD_PSG,
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("restartiempo")
    .setDescription("Restar minutos a un usuario (roles altos).")
    .addUserOption(opt => opt.setName("usuario").setDescription("Usuario a afectar").setRequired(true))
    .addIntegerOption(opt => opt.setName("minutos").setDescription("Minutos a restar").setRequired(true)),
  async execute(interaction) {
    const member = interaction.member;
    const allowed = HIGH_ROLES.some(r => member.roles.cache.has(r));
    if (!allowed) return interaction.reply({ content: "❌ No tenés permiso para usar este comando.", ephemeral: true });

    const target = interaction.options.getUser("usuario");
    const minutos = Math.max(0, interaction.options.getInteger("minutos"));

    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const fichajes = raw ? JSON.parse(raw) : {};

    if (!fichajes[target.id]) {
      return interaction.reply({ content: "❌ Ese usuario no tiene fichajes registrados.", ephemeral: true });
    }

    fichajes[target.id].totalMinutos = Math.max(0, (fichajes[target.id].totalMinutos || 0) - minutos);
    // opcional: si querés también ajustar cantidad, no lo tocamos aquí
    fs.writeFileSync(DATA_FILE, JSON.stringify(fichajes, null, 4));

    const embed = new EmbedBuilder()
      .setTitle("🛠️ Tiempo ajustado")
      .setDescription(`Se restaron **${minutos} minutos** a <@${target.id}>.`)
      .addFields({ name: "PSG", value: `<@${interaction.user.id}>` }, { name: "Fecha", value: formatoCorto(new Date()) });

    await interaction.reply({ embeds: [embed] });

    // Log
    try {
      const logger = require("../utils/logger");
      await logger(interaction.client, `🛠 Acción: Restó ${minutos} minutos a <@${target.id}> • Staff: <@${interaction.user.id}> • ${formatoCorto(new Date())}`);
    } catch {}
  }
};