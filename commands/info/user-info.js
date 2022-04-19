const { MessageEmbed } = require('discord.js') 
const moment = require('moment')
module.exports = {
	name: "user-info",
	description: "donne des infos sur l'utilisateur spécifié",
	execute(message, args){
		errors= message.client.errors
		moment.locale("fr")
		
		if(!args.length) return errors.otherError(message, "Veuillez spécifié un utilisateur avec son id ou en le mentionant !")
		
		const user = message.mentions.members.first() || message.guild.members.cache.get(args[0])
		if(!user) return message.reply("Vous n’avez pas envoyé une bonne id ou une bonne mention !")
		let userInfo = {
			title: "Informations sur " + user.user.username,
			thumbnail: {
                url: user.user.displayAvatarURL({dynamic: true}),
            },
			description: `\n
  __**Info utilisateur**__
      **•** \`ID:\` **${user.id}**
      **•** \`Profile:\` **${user}**
      **•** \`Url de l’avatar:\` **[lien par defaut](${user.user.displayAvatarURL({dynamic: true})}) ou [en png](${user.user.displayAvatarURL({format: "png"})}) **
      **•** \`Bot:\` **${user.user.bot ? 'Oui' : 'Non'}**
      **•** \`Crée le:\` **${moment(user.user.createdAt).format('lll ')} (${moment(user.user.createdAt).fromNow()})**
  __**Info membre**__
      **•** \`Nickname:\` **${user.displayName ? user.displayName : 'Aucun nickname'} **
      **•** \`A rejoint le serveur le:\` **${moment(user.joinedAt).format('lll ')} (${moment(user.joinedAt).fromNow()})**`
			
}
		message.channel.send({embed: userInfo})
    }

}