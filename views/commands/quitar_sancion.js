const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder } = require("@discordjs/builders");

// 🔒 ROL ENCARGADO DE SANCIONES
const ROL_ENC_SANCIONES = "1461620356824698931";

// 📂 ARCHIVO DE SANCIONES
const DATA_FILE = path.join(__dirname, "..", "sanciones.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("quitar_sancion")
    .setDescription("Quitar Warns o Strikes a un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario al que se le quitará la sanción")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("tipo")
        .setDescription("Tipo de sanción a quitar")
        .setRequired(true)
        .addChoices(
          { name: "Warn", value: "Warn" },
          { name: "Strike", value: "Strike" }
        )
    )
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad a quitar (máx 3)")
        .setRequired(true)
        .addChoices(
          { name: "1", value: 1 },
          { name: "2", value: 2 },
          { name: "3", value: 3 }
        )
    ),

  async execute(interaction) {
    // 🔐 CHECK ROL
    if (!interaction.member.roles.cache.has(ROL_ENC_SANCIONES)) {
      return interaction.reply({
        content: "❌ No tenés permiso para usar este comando.",
        ephemeral: true
      });
    }

    const usuario = interaction.options.getUser("usuario");
    const tipo = interaction.options.getString("tipo"); // Warn | Strike
    const cantidad = interaction.options.getInteger("cantidad");

    // 📖 CARGAR DATOS
    let data = {};
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }

    if (!data[usuario.id]) {
      data[usuario.id] = { warns: 0, strikes: 0 };
    }

    // 📉 RESTAR SIN BAJAR DE 0
    if (tipo === "Warn") {
      data[usuario.id].warns = Math.max(
        0,
        data[usuario.id].warns - cantidad
      );
    } else {
      data[usuario.id].strikes = Math.max(
        0,
        data[usuario.id].strikes - cantidad
      );
    }

    // 💾 GUARDAR
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));

    // 📊 TOTAL ACTUAL
    const total =
      tipo === "Warn"
        ? data[usuario.id].warns
        : data[usuario.id].strikes;

    // 📝 MENSAJE FINAL
    const mensaje =
      `<@${usuario.id}> se le removió **(${cantidad}) ${tipo}**.\n` +
      `Total actual: **${total} ${tipo}**.\n` +
      `Autorizado por <@${interaction.user.id}>`;

    await interaction.reply({
      content: mensaje
    });
  }
};
