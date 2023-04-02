const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription(
      "View the current status of the Bot, DiscordAPI, and the Database"
    ),

  async execute(interaction) {
    const botStatus = interaction.client.ws.status === 0 ? "🟢" : "🔴";

    let apiStatus = "🟠";
    try {
      const response = await fetch(
        "https://srhpyqt94yxb.statuspage.io/api/v2/status.json"
      );
      const data = await response.json();
      apiStatus = data.status.indicator === "none" ? "🟢" : "🔴";
    } catch {
      apiStatus = "🔴";
    }

    const apiLatency = Math.round(interaction.client.ws.ping);

    const embed = new Discord.EmbedBuilder()
      .setColor(Discord.Colors.Blurple)
      .setTitle("Component Status")
      .setDescription(
        "Here is the current status of the bot and its components."
      )
      .setTimestamp()
      .addFields(
        { name: "Bot", value: botStatus },
        { name: "Discord API", value: apiStatus },
        { name: "API Latency", value: `${apiLatency}ms` }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
