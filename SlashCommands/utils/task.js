const config = require("../../config");
const fs = require("fs");
const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

const tasksChoices = [{ name: "Toutes les taches", value: "all" }];
const taskFiles = fs.readdirSync("./tasks").filter(file => file.endsWith(".js")); // get the name of every js file in the tasks folder.
for (const file of taskFiles) { // require all tasks file and set the cron.
    const task = require(`../../tasks/${file}`);

    const taskConfig = config.tasksConfig?.find(currentTaskConfig => currentTaskConfig.name === task.name);
    if (taskConfig && !taskConfig.enabled) continue;

    tasksChoices.push({ name: task.name, value: task.name });
}

module.exports = {
    name: "task",
    description: "Permets de lancer une des taches disponibles.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "nom",
            type: ApplicationCommandOptionType.String,
            description: "Le nom de la tache à lancée.",
            required: true,
            choices: tasksChoices,
        },
    ],

    run: async(client, interaction, args) => {
        if (!client.tasks) {
            return await interaction.editReply({ embeds: [new EmbedBuilder()
                .setTitle("Erreur, bot non démarré.")
                .setDescription("Désolé, veuillez attendre le bot démarre complètement pour exécuter une tache."
                    + "\nRéessayer dans quelques minutes.")
                .setColor("#FF0000")
            ] });
        }
        await interaction.editReply("Lancement de la tache en cours...");
        const session = await client.pronote.login();
        let errorOccurred = false;
        try {
            if (args[0] === "all") {
                for (const task in client.tasks) {
                    await client.tasks[task].run(session);
                }
            } else {
                await client.tasks[args[0]].run(session);
            }

        } catch (error) {
            console.error("Error while running tasks:", error);
            errorOccurred = true;
        } finally {
            await client.pronote.logout(session, "task run");
        }
        if (errorOccurred) {
            return await interaction.editReply({ content: "", embeds: [new EmbedBuilder()
                .setTitle("Erreur.")
                .setDescription("Une erreur est survenue lors de l'éxécution de la tache.")
                .setColor("#FF0000")
            ] });
        }
        await interaction.editReply({ content: "", embeds: [new EmbedBuilder()
            .setTitle("Tache exécutée.")
            .setDescription("La tache a été éxécutée avec succès.")
            .setColor("#00FF00")
        ] });
    }
};
