const config = require("../../config");
const fs = require("fs");
const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

const tasksChoices = [];
const taskFiles = fs.readdirSync("./tasks").filter(file => file.endsWith(".js")); // get the name of every js file in the tasks folder.
for (const file of taskFiles) { // require all tasks file and set the cron.
    const task = require(`../../tasks/${file}`);

    const taskConfig = config.tasksConfig?.find(currentTaskConfig => currentTaskConfig.name === task.task.name);
    if (taskConfig && !taskConfig.enabled) continue;

    tasksChoices.push({ name: task.task.name, value: task.task.name });
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
        client.tasks[args[0]].run();
        interaction.editReply("La tache a bien été lancée.");
    }
};
