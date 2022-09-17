
module.exports = {
	name: "shutdown",
	aliases: ['stop', 'arret', 'extinction'],
	description: "permet d'arrêter le bot",
	inDev: false,
	 execute (message, args, config)  {
                const whitelist = message.client.config.whitelist;
		if(!whitelist.includes(message.author.id)) return;
		message.delete();
                if(args[0] === "-c") {
                        return shutdown(message);
                }
		message.channel.send({embed: {
          title: "Voulez vous vraiment éteindre le bot ?",
          description: ":warning: La seule facon de le rallumer serra depuis le panel :warning:",
          footer: {
                text: "Demmande d'arret démandé: " + message.author.tag
        },
        timestamp: new Date()
        
        }}).then( async(messageS) => {
      
                        await messageS.react("✅");
                        await 
                        messageS.react("❌");
                        messageS.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '✅' || reaction.emoji.name == '❌'),
                            { max: 1, time: 30000 }).then(collected => {
                                messageS.delete();
                                    if (collected.first().emoji.name == '✅') {
                                            message.reply('Arrêt en cours... ').then(async function (){

                                            console.log("demmande d’arret de " + message.author.username);
                                            if(args[0] === "restart") {
                                                console.log("arret en cours...")
                                                await message.client.destroy()
                                                await message.client.login(token) 
                                           
                                             } else {
                                             console.log("redémarrage en cours")
                                             return shutdown(message);
                                       
                                      }
                                    })
                                    
                                    }else message.reply('Operation annulé.');
                            }).catch((err) => {
                            	console.error(err)
                                    message.reply('Aucune reaction apres 30sec, operation annulé');
                            });

  })
        async function shutdown(message) {
                await message.channel.send("Le bot va redémaré !")
                //console.log(message.client.fonction)
                await message.client.fonction.logEmbed(message, "Une erreur est survenue:",  "\nsur la commande \"")
                await message.client.fonction.log(message, "Le bot va/a redémémaré suite a la demande de " + message.author.user)
                await process.exit(1)

        }   
    }

}