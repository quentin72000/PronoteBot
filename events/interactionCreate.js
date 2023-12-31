const client = require("../index");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

client.on("interactionCreate", async(interaction) => {
    // Slash Command Handling
    if (interaction.isCommand()) {
        await interaction.deferReply({ ephemeral: false });

        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd) return interaction.followUp({ content: "Une erreur est survenue, la commande n'existe pas." });

        const args = [];

        for (const option of interaction.options.data) {
            if (option.type === ApplicationCommandOptionType.Subcommand) {
                if (option.name) args.push(option.name);
                option.options?.forEach((x) => {
                    if (x.value) args.push(x.value);
                });
            } else if (option.value) args.push(option.value);
        }
        interaction.member = interaction.guild.members.cache.get(interaction.user.id);

        cmd.run(client, interaction, args);
    }

    // Context Menu Handling
    if (interaction.isContextMenuCommand()) {
        await interaction.deferReply({ ephemeral: false });
        const command = client.slashCommands.get(interaction.commandName);
        if (command) command.run(client, interaction);
    }

    if (interaction.isButton()) {
        if (interaction.customId === "refresh_timetable") {
            await interaction.deferReply({ ephemeral: true });
            await client.tasks["updateTimetable"].run();
            await interaction.editReply({ content: "Emploi du temps actualisé !", ephemeral: true });

        } else if (interaction.customId === "homework_done") {
            await interaction.deferReply({ ephemeral: true });


            const result = client.db.prepare("SELECT * FROM homework WHERE message_id = ?").get(interaction.message.id);
            if (result) {
                const session = await client.pronote.login();
                await session.homeworks(new Date(result.date_donne), new Date(result.date_rendue))
                    .then(async(homeworks) => {
                        if (homeworks) {
                            let found = false;
                            for (let i = 0; i < homeworks.length; i++) {
                                const value = homeworks[i];
                                if (value.id === result.id) {
                                    found = true;
                                    const sqlUpdateHomeWork = client.db.prepare(`
                                        UPDATE homework 
                                        SET fait = 1 
                                        WHERE message_id = ?
                                    `);
                                    if (!value.done) { // If homework is not already done in the API, mark it as done and update the DB
                                        await value.markAs(true);
                                        await sqlUpdateHomeWork.run(interaction.message.id);
                                        await interaction.message.delete();

                                        await interaction.editReply({
                                            embeds: [getHomeworkEmbed(false)],
                                            ephemeral: true
                                        });
                                    } else { // If homework is already done in the API, just update the DB
                                        await sqlUpdateHomeWork.run(interaction.message.id);
                                        await interaction.message.delete();

                                        await interaction.editReply({
                                            embeds: [getHomeworkEmbed(false)],
                                            ephemeral: true
                                        });
                                    }
                                    break;
                                }
                            }
                            if (!found) { // If the homework was not found in the API, reply with the same error message
                                await interaction.editReply({ embeds: [getHomeworkEmbed(true)], ephemeral: true });
                            }
                            await client.pronote.logout(session, "homework done");
                        } else { // If no homeworks are found in the API, reply with the same error message
                            await interaction.editReply({ embeds: [getHomeworkEmbed(true)], ephemeral: true });
                        }
                    });
            } else { // If no result is found in the DB, reply with the same error message
                await interaction.editReply({ embeds: [getHomeworkEmbed(true)], ephemeral: true });
            }
        }
    }
});


function getHomeworkEmbed(error) {
    if (error) return new EmbedBuilder()
        .setTitle("Erreur: Devoir non trouvé !")
        .setColor("RED");
    return new EmbedBuilder()
        .setTitle("Devoir marqué comme fait !")
        .setColor("GREEN");
}