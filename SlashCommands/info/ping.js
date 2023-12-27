const moment = require("moment");
require("moment-duration-format");

module.exports = {
    name: "ping",
    description: "Renvoie le ping de discord et du bot.",
    type: "CHAT_INPUT",

    run: async(client, interaction) => {
        const uptime = moment.duration(client.uptime)
            .format(" D [jours(s)], H [heure(s)], m [minute(s)], s [seconde(s)]");
        const pingEmbed = {
            title: "Ping et Uptime",
            description: `**Uptime** : ${uptime}`
              + `\n**Latence du bot** : ${Date.now() - interaction.createdTimestamp}ms`
              + `\n**Latence API discord** : ${client.ws.ping}ms`,
            color: "#1E7751"
        };
        await interaction.editReply({
            embeds: [pingEmbed]
        });
    }
};
