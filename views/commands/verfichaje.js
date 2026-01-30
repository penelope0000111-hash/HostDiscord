const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { formatoCorto } = require("../utils/fecha");
const ROLES = require("../utils/roles");

const DATA_FILE = path.join(__dirname, "..", "fichajes.json");

// Roles de alto nivel permitidos a ver fichajes de otros
const HIGH_ROLES = [
  ROLES.DUEÑO,
  ROLES.CO_DUEÑO,
  ROLES.HEAD_PSG,
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verfichaje")
    .setDescription("Ver resumen de fichajes (si sos alto, podés ver a otros).")
    .addUserOption(opt => opt.setName("usuario").setDescription("Usuario a ver").setRequired(false)),
  async execute(interaction) {
    // Cargar datos
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const fichajes = raw ? JSON.parse(raw) : {};

    const member = interaction.member;
    const opc = interaction.options.getUser("usuario");
    let targetUser = interaction.user;

    if (opc) {
      // Sólo HIGH_ROLES pueden ver a otros
      const allowed = HIGH_ROLES.some(r => member.roles.cache.has(r));
      if (!allowed) return interaction.reply({ content: "❌ No tenés permiso para ver fichajes de otros usuarios.", ephemeral: true });
      targetUser = opc;
    }

    const uid = targetUser.id;
    if (!fichajes[uid]) {
      return interaction.reply({ content: "No tiene fichajes registrados.", ephemeral: true });
    }

    const total = fichajes[uid].totalMinutos || 0;
    const cantidad = fichajes[uid].cantidad || 0;
    const horas = Math.floor(total / 60);
    const minutos = total % 60;

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("📊 Fichaje Total")
      .setDescription(`Resumen de fichajes de <@${uid}>`)
      .addFields(
        { name: "⏱️ Tiempo total fichado", value: `${horas}h ${minutos}m` },
        { name: "🌐 Total en minutos", value: `${total} minutos` },
        { name: "📁 Total de fichajes", value: `${cantidad}` },
        { name: "Sistema de fichajes", value: formatoCorto(new Date()) }
      );

    await interaction.reply({ embeds: [embed] });
  }
};