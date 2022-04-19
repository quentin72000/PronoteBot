const {MessageEmbed} = require("discord.js")

module.exports = {
    name: 'avatar',
    aliases: ['pp', 'profil'],
    description: "Envoie votre avatar ou l’avatar des personnes mentionnées",
    run: async (client, message, args) => {
      if(!message.mentions.users.size){
        return sendLink(message.author, message, message.author.displayAvatarURL({ format: 'png'}))
     // message.channel.send(`Voici votre avatar ! :  ${message.author.displayAvatarURL({ format: 'png'})}`)
         
    
    }
      const avatarList = message.mentions.users.map(user => {
       return sendLink(user, message, user.displayAvatarURL({dynamic: true}))
      
    });
    // message.channel.send(avatarList);
 
  }
         
      
    
}
function sendLink (user, message, link) {
  message.channel.send({embed: {
    title: "Lien d’avatar de " + user.tag,
    description: `[png](${user.displayAvatarURL({format: "png"})})`
    + `\n[jpeg](${user.displayAvatarURL({format: "jpeg"})})`
    + `\n[gif](${user.displayAvatarURL({format: "gif"})})`,
    footer: {
      text: `Lien d'avatar de: ${user.username}`,
      icon_url: user.displayAvatarURL({dynamic: true})
    },
    image: {
      url: link
    }
  }})
}