const { MessageEmbed } = require('discord.js');
const moment = require("moment");
require("moment-duration-format");

module.exports = {
    name: 'pingv2',
    aliases: ['uptime', 'stats', 'status', 'statistique'],
    description: 'Envoie le ping du bot et son uptime',
    run: async (client, message, args) => {



let time = Date.now();
const uptime = moment.duration(message.client.uptime).format(" D [jours(s)], H [heure(s)], m [minute(s)], s [seconde(s)]");
//    await message.channel.send("Chargement...").then(async(m) => await m.edit(`**Latence du bot :** ${Date.now() - time} ms\n**API de Discord :** ${client.ws.ping} ms`))
let pingEmbedNew = {
	title: "Ping et Uptime",
	description: `**Uptime** : ${uptime}\n**Latence** : ${ Date.now() - message.createdTimestamp}ms\n**Latence API discord** : ${message.client.ws.ping}ms`,
	color: "#0099ff"
}
        message.channel.send({embed: pingEmbedNew});
    }
    
};