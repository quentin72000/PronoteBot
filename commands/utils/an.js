const Discord= require('discord.js');

module.exports = {
    name: 'an',
    guildOnly: true,
    run: async (client, message, args) => {
     errors = client.errors
   	if (!message.member.hasPermission('MANAGE_MESSAGES')) return errors.noPerms(message, 'MANAGE_MESSAGES');
   	message.delete()
   	message.channel.send("Entrez une couleur (en hex code\nexemple: ```10C8AF ou #10C8AF```)").then(mC => message.delete({timeout: 10000}))
   	const title = args.join(" ");
   	message.channel.awaitMessages(m => m.author.id == message.author.id,
                            {max: 1, time: 300000}).then(collectedC => {
                                    // only accept messages by the user who sent the command
                                    // accept only 1 message, and return the promise after 300000ms = 3min

                                    //set la color de l’embed
                                           
                                           const color = collectedC.first().content; 
                                           /*
                                           Discord.resolveColor(color).catch( () =>{    // ne marche pas
return message.channel.send("couleur invvalide, annulation de la commande");

})
*/
                                            collectedC.first().delete()
                                            mC.delete()
                                            message.channel.send("Entrez une description.").then(mD => message.delete({timeout: 10000}))
                                            message.channel.awaitMessages(m => m.author.id == message.author.id,
                            {max: 1, time: 300000}).then(collectedD => {
                                    // only accept messages by the user who sent the command
                                    // accept only 1 message, and return the promise after 300000ms = 3min

                                    // first (and, in this case, only) message of the collection
                                           const desc = collectedD.first().content; 
                                            collectedD.first().delete()
                                            mD.delete()
                                            message.channel.send({embed:{
                                            	title: title,
                                                color: color,
                                                description: desc
}})
                                   
                                    }).catch((err) => {
                                  message.reply('No answer after 3 min, operation canceled.');
                                  console.log(err)
                                  return;
                            })
                                    }).catch((err) => {
                                  message.reply('No answer after 3 min, operation canceled.');
                                  console.log(err)
                                  return;
                            });
                            

    }
}