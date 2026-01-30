const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const HEAD_PFA_ROLE_ID = "1461620323366736089";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Borra una cantidad de mensajes (solo Head PFA)")
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de mensajes a borrar (1-100)")
        .setRequired(true)
    ),

  async execute(interaction) {
    // 🔒 Check rol Head PFA
    if (!interaction.member.roles.cache.has(HEAD_PFA_ROLE_ID)) {
      return interaction.reply({
        content: "⛔ **Solo el Head PFA puede usar este comando.**",
        ephemeral: true,
      });
    }

    const cantidad = interaction.options.getInteger("cantidad");

    if (cantidad < 1 || cantidad > 100) {
      return interaction.reply({
        content: "❌ La cantidad debe ser entre **1 y 100**.",
        ephemeral: true,
      });
    }

    try {
      const mensajes = await interaction.channel.bulkDelete(cantidad, true);

      await interaction.reply({
        content: `🧹 **${mensajes.size} mensajes borrados correctamente.**`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ Ocurrió un error al borrar los mensajes.",
        ephemeral: true,
      });
    }
  },
};
