const Discord = require('discord.js');

module.exports = {
    name: 'say',
    aliases: ['dire'],
    guildOnly: true,
    description: 'envoie le message demandé',
    execute(message, args, client, config) {
      errors = client.errors
      
      if (!message.member.hasPermission('MANAGE_MESSAGES')) return errors.noPerms(message, 'MANAGE_MESSAGES');
      let sayMessage;
      

        if (!args.length){
            message.channel.send('Vous devez mettre un texte après la commande !');
        }else if(args[0] === "-e"){
    //    	let color = args.splice
            sayMessage = args.splice(2).join(" ");
            message.delete();
            message.channel.send({embed: {description:sayMessage, color: sayMessage}})
        } else{
        	sayMessage = args.join(" ");
            message.delete();
            message.channel.send(sayMessage)

}


    }
    
};