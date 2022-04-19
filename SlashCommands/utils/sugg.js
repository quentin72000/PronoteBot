const { Client, CommandInteraction } = require("discord.js");
const moment = require("moment");
module.exports = {
    name: "sugg",
    description: "Permet de faire une suggestion.",
    type: 'CHAT_INPUT',
    options: [
        {
            name: 'type',
            type: 'STRING',
            description: 'Le type de suggestion.',
            required: true,
            choices: [
                {
                    name: "Minecraft",
                    value: "mc"
                },
                {
                    name: 'Discord',
                    value: 'discord'
                },
                {
                    name: 'Site',
                    value: 'site'
                }
            ]
        },
        {
            name: "contenu",
            type: "STRING",
            description: "Le contenu de la suggestion qui serra affficher.",
            required: true,
        }

    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        // console.log(args)
        let type;
        switch (args[0]) {
            case "mc":
                type = "Minecraft"
                break;
            case "discord":
                type = "Discord"
                break;
            case "site":
                type = "le Site"
                break;

        }
        try {
            const channel = await client.channels.cache.get(client.config.suggId)
            channel.send({embeds: [{
                title: "Suggestion de " + interaction.user.tag + " concernant " + type,
                author: {
                    name: interaction.user.tag,
                    icon_url: interaction.user.displayAvatarURL({dynamic: true})
                },
                color: "RANDOM",
                description: args[1],
                timestamp: new Date(),
            }]}).then(async message => {
                await message.react("✅")
                await message.react("❌")
            })
            interaction.editReply("Suggestion envoyé avec succés !")
        } catch (error) {
            interaction.editReply("Une erreur est survenue lors de l'envoies de la suggestion, veuillez réessayer ou contacter un admistrateur")
            console.log(error)
        }
        



    }
};
