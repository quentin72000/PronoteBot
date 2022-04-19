const { Message, Client } = require("discord.js");

module.exports = {
    name: "pingv1",
    aliases: ['pv1'],
    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        message.channel.send(`${client.ws.ping} ws ping`);
    },
};
