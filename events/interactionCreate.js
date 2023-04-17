const client = require("../index");
const { MessageEmbed } = require("discord.js");

client.on("interactionCreate", async (interaction) => {
    // Slash Command Handling
    if (interaction.isCommand()) {
        await interaction.deferReply({ ephemeral: false }).catch(() => {});

        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd)
            return interaction.followUp({ content: "An error has occured " });

        const args = [];

        for (let option of interaction.options.data) {
            if (option.type === "SUB_COMMAND") {
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
    if (interaction.isContextMenu()) {
        await interaction.deferReply({ ephemeral: false });
        const command = client.slashCommands.get(interaction.commandName);
        if (command) command.run(client, interaction);
    }

    if(interaction.isButton()){
        if(interaction.customId === "refresh_timetable"){
            await interaction.deferReply({ ephemeral: true});
            await client.tasks["updateTimetable"].run();
            await interaction.editReply({content: "Emploi du temps actualisé !", ephemeral: true});
            
        }else if (interaction.customId === "homework_done"){
            await interaction.deferReply({ ephemeral: true});


            client.db.get(`SELECT * FROM homework WHERE message_id = "${interaction.message.id}"`, async (err, result) => {
                if (err) throw err;
                if (result) {
                    let session = await client.pronote.login();
                    await session.homeworks(new Date(result.date_donne), new Date(result.date_rendue)).then(async(homeworks) => {
                        if (homeworks) {
                            let found = false;
                            for (let i = 0; i < homeworks.length; i++) {
                                const value = homeworks[i];
                                if (value.id === result.id) {
                                    found = true;
                                    if (value.done !== true) { // If homework is not already done in the API, mark it as done and update the DB
                                        await value.markAs(true);
                                        await client.db.run(`UPDATE homework SET fait = 1 WHERE message_id = "${interaction.message.id}"`, async(err) => {
                                            if (err) throw err;
                                            await interaction.message.delete()
                                            await interaction.editReply({embeds: [getHomeworkEmbed(false)], ephemeral: true});
                                        });
                                    } else { // If homework is already done in the API, just update the DB
                                        await client.db.run(`UPDATE homework SET fait = 1 WHERE message_id = "${interaction.message.id}"`, async(err) => {
                                            if (err) throw err;
                                            await interaction.message.delete()
                                            await interaction.editReply({embeds: [getHomeworkEmbed(false)], ephemeral: true});
                                        });
                                    }
                                    break;
                                }
                            }
                            if (!found) { // If the homework was not found in the API, reply with the same error message
                                await interaction.editReply({embeds: [getHomeworkEmbed(true)], ephemeral: true});
                            }
                            await client.pronote.logout(session, "homework done");
                        } else { // If no homeworks are found in the API, reply with the same error message
                            await interaction.editReply({embeds: [getHomeworkEmbed(true)], ephemeral: true});
                        }
                    });
                } else { // If no result is found in the DB, reply with the same error message
                    await interaction.editReply({embeds: [getHomeworkEmbed(true)], ephemeral: true});
                }
            });            
        }
    }
});


function getHomeworkEmbed(error) {
    if(error){
        return new MessageEmbed()
        .setTitle("Erreur: Devoir non trouvé !")
        .setColor("RED");
    }else{
        return new MessageEmbed()
        .setTitle("Devoir marqué comme fait !")
        .setColor("GREEN");
    }

    
}