const { Permissions: {FLAGS}} = require("discord.js")
module.exports = {
	name: 'annonce',
	description: "Faire une annonce",
	run: async (client, message, args) => {
		if(!message.member.permissions.has(FLAGS.ADMINISTRATOR)) return errors.noPerms(message, "ADMINISTRATOR");

		if(!args.join(" ").split(config.separator).length == 2){
			message.channel.send({
				embed:{
					title:"Un ou des arguments sont manquants !",
					color:"#AA0000"
				}
			})
			return
		}
		const channel = client.channels.cache.get(config.testServ.channels.general);

		channel.send({
			embed: {
				color: "#CCCCCC",
				title: args.join(" ").split(config.separator)[0],
				description: args.join(" ").split(config.separator)[1]
			}
		})
		.then(async function(embed){
			await embed.react("1️⃣");
			await embed.react("👁️");
			await embed.react("2️⃣");
		})

		message.delete()
	},
};