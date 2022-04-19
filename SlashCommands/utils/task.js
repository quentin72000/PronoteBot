const { Client, CommandInteraction } = require("discord.js");
// const client = require("../../index.js")
let fs = require("fs");
let tasksChoices = []
console.log()
const  taksFiles = fs.readdirSync("./tasks").filter(file => file.endsWith('.js')); // get the name of every js file in the tasks folder.
        for(const file of taksFiles){ // require all tasks file and set the cron.
            const task = require(`../../tasks/${file}`);
            tasksChoices.push({name: task.task.name, value: task.task.name})
        }
module.exports = {
    name: "task",
    description: "Permets de lancer une des taches mdisponibles.",
    type: 'CHAT_INPUT',
    options: [
        {
            name: 'nom',
            type: 'STRING',
            description: 'Le nom de la tache à lancée.',
            required: true,
            choices: tasksChoices,
        },
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        if(!client.tasks){
            return await interaction.editReply({embeds: [{
                title: "Erreur, bot non démarré.",
                description: "Désolé, veuillez attendre le bot démarre complètement pour exécuter une tache.\nRéessayer dans quelques minutes.",
                color: "#FF0000"
            }]})
        }
        await client.tasks[args[0]].run()
        interaction.editReply("La tache a bien été lancée.")
    }
};
