const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

const DATA_FILE = path.join(__dirname, "..", "fichajes.json");

// 🔒 ROL HEAD PSG
const ROL_HEAD_PSG = "1461620323366736089";

function minutosAHoras(min) {
  return Math.floor(min / 60);
}

function formatNumber(num) {
  return num.toLocaleString("es-AR");
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ranking")
    .setDescription("Muestra el ranking de horas y facturación"),

  async execute(interaction) {
    // 🔐 CHECK ROL
    if (!interaction.member.roles.cache.has(ROL_HEAD_PSG)) {
      return interaction.reply({
        content: "❌ No tenés permiso para usar este comando.",
        ephemeral: true
      });
    }

    if (!fs.existsSync(DATA_FILE)) {
      return interaction.reply({
        content: "❌ No hay datos registrados.",
        ephemeral: true
      });
    }

    const fichajes = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

    const usuarios = Object.entries(fichajes)
      .map(([id, data]) => ({
        id,
        minutos: data.totalMinutos || 0,
        facturado: data.facturado || 0
      }))
      .filter(u => u.minutos > 0 || u.facturado > 0);

    if (usuarios.length === 0) {
      return interaction.reply({
        content: "❌ No hay datos suficientes.",
        ephemeral: true
      });
    }

    const medallas = ["🥇", "🥈", "🥉"];

    // 🔹 TOP HORAS
    const topHoras = [...usuarios]
      .sort((a, b) => b.minutos - a.minutos)
      .slice(0, 5);

    const horasText = topHoras
      .map((u, i) => {
        const pos = medallas[i] || `${i + 1}°`;
        return `${pos} <@${u.id}> — **${minutosAHoras(u.minutos)} Horas**`;
      })
      .join("\n");

    // 🔹 TOP FACTURAS
    const topFacturas = [...usuarios]
      .sort((a, b) => b.facturado - a.facturado)
      .slice(0, 5);

    const facturasText = topFacturas
      .map((u, i) => {
        const pos = medallas[i] || `${i + 1}°`;
        return `${pos} <@${u.id}> — **$${formatNumber(u.facturado)}**`;
      })
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor("#f1c40f")
      .setTitle("📊 Ranking General")
      .setDescription(
        `**🕒 Horas trabajadas**\n` +
        `${horasText || "Sin datos"}\n\n` +
        `────────────────────────\n\n` +
        `**💰 Facturado**\n` +
        `${facturasText || "Sin datos"}`
      )
      .setFooter({ text: "Sistema de fichajes" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
