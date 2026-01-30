const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder } = require("@discordjs/builders");

// 🔒 ROL ENCARGADO DE SANCIONES
const ROL_ENC_SANCIONES = "1461620356824698931";

// 🧑‍⚖️ ROL CIVIL
const ROL_CIVIL = "1461620353397948562";

// 📂 ARCHIVO DE SANCIONES
const DATA_FILE = path.join(__dirname, "..", "sanciones.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sancionar")
    .setDescription("Aplicar una sanción acumulativa (Warn o Strike)")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario a sancionar")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("tipo")
        .setDescription("Tipo de sanción")
        .setRequired(true)
        .addChoices(
          { name: "Warn", value: "Warn" },
          { name: "Strike", value: "Strike" }
        )
    )
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad (máx 3)")
        .setRequired(true)
        .addChoices(
          { name: "1", value: 1 },
          { name: "2", value: 2 },
          { name: "3", value: 3 }
        )
    )
    .addStringOption(option =>
      option
        .setName("motivo")
        .setDescription("Motivo de la sanción")
        .setRequired(true)
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
    const miembro = await interaction.guild.members.fetch(usuario.id);
    const tipo = interaction.options.getString("tipo");
    const cantidad = interaction.options.getInteger("cantidad");
    const motivo = interaction.options.getString("motivo");

    // 📖 CARGAR DATOS
    let data = {};
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }

    if (!data[usuario.id]) {
      data[usuario.id] = { warns: 0, strikes: 0 };
    }

    let mensajeExtra = "";

    // ➕ APLICAR SANCIÓN (LÓGICA CORREGIDA)
    if (tipo === "Warn") {
      const totalWarns = data[usuario.id].warns + cantidad;

      const strikesExtra = Math.floor(totalWarns / 3);
      const warnsRestantes = totalWarns % 3;

      data[usuario.id].warns = warnsRestantes;
      data[usuario.id].strikes += strikesExtra;

      if (strikesExtra > 0) {
        mensajeExtra += `\n⚠️ **${strikesExtra} Strike(s) generado(s) automáticamente por Warns.**`;
      }
    } else {
      data[usuario.id].strikes += cantidad;
    }

    // 🚨 LIMITAR STRIKES A 3
    if (data[usuario.id].strikes > 3) {
      data[usuario.id].strikes = 3;
    }

    // 🚫 CASTIGO POR 3 STRIKES
    if (data[usuario.id].strikes === 3) {
      const rolesAEliminar = miembro.roles.cache.filter(
        r => r.id !== interaction.guild.id && r.id !== ROL_CIVIL
      );

      await miembro.roles.remove(rolesAEliminar);
      await miembro.roles.add(ROL_CIVIL);

      mensajeExtra +=
        "\n🚫 **El usuario alcanzó 3 Strikes.**\n" +
        "Todos los roles fueron removidos y se asignó **Civil**.";
    }

    // 💾 GUARDAR
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));

    // 📝 MENSAJE FINAL (YA CON VALORES CORRECTOS)
    const mensaje =
      `<@${usuario.id}> fue sancionado.\n\n` +
      `📌 **Motivo:** ${motivo}\n` +
      `⚠️ **Warns:** ${data[usuario.id].warns}\n` +
      `🚨 **Strikes:** ${data[usuario.id].strikes}\n` +
      `👮 Autorizado por <@${interaction.user.id}>` +
      mensajeExtra;

    await interaction.reply({ content: mensaje });
  }
};
