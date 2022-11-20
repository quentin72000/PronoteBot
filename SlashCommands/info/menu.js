const {
    Client,
    CommandInteraction
} = require("discord.js");
const {
    PronoteSession
} = require("pronote-api")
// const moment = require("moment");
module.exports = {
    name: "menu",
    description: "Renvoie le menu du jour.",
    type: 'CHAT_INPUT',
    /**
     *
     * @param {Client} client
     * @param {String[]} args
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction, args) => {
        let embed = {}
        let menu = await client.session.menu()
        if (!menu[0]) {
            embed = {
                title: "Aucun menu disponible aujourd'hui",
                color: "red"
            }
        } else {
            
            embed = {
                title: "Menu du " + new Date(menu[0].date).toLocaleDateString("fr"),
                description: ""
            }

            menu[0].meals[0].forEach((value) => {
                value.forEach((item) =>{
                    embed.description += item.name + '\n'
                })
                embed.description += "\n"

            })
        }

        await interaction.editReply({
            embeds: [embed]
        });
    }
};