
module.exports = {
	name: 'embed',
	description: 'Commande de test',
	run: async (client, message, args) => {
		if(!message.member.hasPermission('ADMINISTRATOR')) return client.errors.noPerms(message, "ADMINISTRATOR");

		messageArray = args.join(" ").split(config.separator)

		resultEmbed = {}
		
		if(messageArray.length > 0) {
			resultEmbed.title = messageArray[0]
		}

		if(messageArray.length > 1) {
			resultEmbed.description = messageArray[1]
		}

		if(messageArray.length > 2) {
			resultEmbed.color = messageArray[2]
		}

		if(messageArray.length > 3) {
			resultEmbed.thumbnail = messageArray[3]
		}

		message.channel.send({
			embed: resultEmbed
		})

		message.delete()
	},
};