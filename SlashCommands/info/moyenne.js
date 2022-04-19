const { Client, CommandInteraction } = require("discord.js");
const pronote = require("../../pronote.js")
module.exports = {
    name: "moyenne",
    description: "Renvoie la moyenne stocker dans la base de donées ou mis à jours si préciser.",
    type: 'CHAT_INPUT',
	options: [{
		name: "update",
		description: "Precise si le programe dois allée chercher la moyenne sur pronote ou dans la base de donées.",
		type: "BOOLEAN",
        required: false
	}],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
		if(args[0] == true){
            await interaction.editReply("Lancement de la tache en cours... Cella peut prendre plusieurs minutes...")
            pronote.getAllData(async(data) => {
                await interaction.editReply("Votre moyenne est: " + data.notes.moyGenerale.V.replace(",", "."))
            })
        }
        else{
            let jsondb = require('../../db.json')
            await interaction.editReply("Votre moyenne est: " + jsondb.notes.moyGenerale.V.replace(",", "."))
        }
	}
}
