const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const ROLES = require("../utils/roles");

const DATA_FILE = path.join(__dirname, "..", "fichajes.json");

function formatNumber(num) {
  return num.toLocaleString("es-AR");
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("factura")
    .setDescription("Registrar una factura a tu nombre")
    .addIntegerOption(option =>
      option
        .setName("monto")
        .setDescription("Monto facturado")
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.member;

    // 🔐 Permisos
    if (!member.roles.cache.has(ROLES.PSG)) {
      return interaction.reply({
        content: "❌ No tenés permiso para usar este comando.",
        ephemeral: true
      });
    }

    const monto = interaction.options.getInteger("monto");

    if (monto <= 0) {
      return interaction.reply({
        content: "❌ El monto debe ser mayor a 0.",
        ephemeral: true
      });
    }

    // 📂 Leer datos
    let fichajes = {};
    if (fs.existsSync(DATA_FILE)) {
      fichajes = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }

    const uid = interaction.user.id;

    if (!fichajes[uid]) {
      fichajes[uid] = {
        totalMinutos: 0,
        cantidad: 0,
        facturado: 0
      };
    }

    fichajes[uid].facturado = (fichajes[uid].facturado || 0) + monto;

    fs.writeFileSync(DATA_FILE, JSON.stringify(fichajes, null, 4));

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("💰 Factura registrada")
      .setDescription("La factura fue registrada correctamente.")
      .addFields(
        { name: "👤 Usuario", value: `<@${uid}>`, inline: true },
        { name: "💵 Monto agregado", value: `$${formatNumber(monto)}`, inline: true },
        { name: "📊 Total facturado", value: `$${formatNumber(fichajes[uid].facturado)}`, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
