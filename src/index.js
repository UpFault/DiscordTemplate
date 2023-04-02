const {
    Client,
    GatewayIntentBits,
    Collection,
    ActivityType,
  } = require("discord.js");
  const fs = require("node:fs/promises");
  const { REST } = require("@discordjs/rest");
  const { Routes } = require("discord-api-types/v9");
  const path = require("node:path");
  require("dotenv").config();
  
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.commands = new Collection();
  const cmdsDirPath = path.join(__dirname, "cmds");
  
  async function registerCommands() {
    const commandFiles = await fs.readdir(cmdsDirPath);
    const commands = [];
  
    for (const file of commandFiles) {
      if (!file.endsWith(".js")) continue;
  
      try {
        const command = require(`./cmds/${file}`);
        if ("data" in command && "execute" in command) {
          commands.push(command.data.toJSON());
          client.commands.set(command.data.name, command);
        } else {
          console.warn(
            `The command at ${file} is missing a required "data" or "execute" property.`
          );
        }
      } catch (error) {
        console.error(`Failed to load command from ${file}:`, error);
      }
    }
  
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  
    try {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commands,
      });
      console.log(
        `Successfully registered ${commands.length} application commands.`
      );
    } catch (error) {
      console.error("Failed to register application commands:", error);
    }
  }
  
  client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({
      activities: [{ name: "Bot Presence", type: ActivityType.Competing }],
      status: "online",
    });
  
    await registerCommands();
  });
  
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
  
    const command = client.commands.get(interaction.commandName);
  
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }
  
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(
        `Failed to execute command ${interaction.commandName}:`,
        error
      );
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  });
  
  client.login(process.env.TOKEN);
  