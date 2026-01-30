const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Guía de uso del sistema de fichajes y facturación"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("#2ecc71")
      .setTitle("📘 Sistema de Fichajes – Ayuda")
      .setDescription(
        "Guía oficial para el uso correcto del sistema.\n" +
        "⚠️ El incumplimiento de estas normas puede resultar en sanciones."
      )
      .addFields(
        {
          name: "📥 Abrir fichaje",
          value:
            "`/entrada`\n\n" +
            "Usalo **al comenzar servicio**.\n" +
            "❌ No abrir fichaje sin estar en rol.",
        },
        {
          name: "📤 Cerrar fichaje",
          value:
            "`/salida`\n\n" +
            "Usalo **al finalizar servicio**.\n" +
            "El sistema calcula automáticamente tus horas.",
        },
        {
          name: "💰 Facturación (/factura)",
          value:
            "`/factura <monto>`\n\n" +
            "📌 **¿Cuándo se factura?**\n" +
            "Cuando cacheás a una persona que **estaba robando** y le encontrás dinero en negro.\n\n" +
            "📸 **CAPTURA OBLIGATORIA**:\n" +
            "• Captura de **TODA la pantalla**\n" +
            "• Debe verse **el inventario abierto de la PSG**\n" +
            "• Debe verse claramente **el monto encontrado**\n\n" +
            "❌ No se aceptan recortes\n" +
            "❌ No se aceptan fotos parciales\n\n" +
            "🧾 **Ejemplo**:\n" +
            "Encontrás $150.000 en negro → `/factura 150000`",
        },
        {
          name: "⚠️ Reglas importantes",
          value:
            "• Prohibido inventar montos\n" +
            "• Toda factura debe tener prueba válida\n" +
            "• El abuso del sistema conlleva sanciones",
        },
        {
          name: "🏆 Ranking",
          value:
            "`/ranking`\n\n" +
            "Muestra el ranking de:\n" +
            "• Horas trabajadas\n" +
            "• Dinero facturado",
        }
      )
      .setFooter({ text: "Sistema de fichajes • Uso obligatorio" })
      .setTimestamp();

    // 🔓 Mensaje público (visible para todos)
    await interaction.reply({
      embeds: [embed]
    });
  }
};
