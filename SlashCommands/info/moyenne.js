const {
    Client,
    CommandInteraction
} = require("discord.js");
const pronote = require("../../pronote.js")
module.exports = {
    name: "moyenne",
    description: "Renvoie la moyenne stocker dans la base de donées ou mis à jours si préciser.",
    type: 'CHAT_INPUT',
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        let moyenne = await client.session.marks()
        // console.log(moyenne)
        await interaction.editReply({embeds: [{
            title: "Moyennes",
            fields: [{
                name: "Moyenne de l'élève",
                value: moyenne.averages.student + "/20"
            },
            { 
                name: "Moyenne de la classe",
                value: moyenne.averages.studentClass + "/20"            }
        ]
        }]})

  


    }
}