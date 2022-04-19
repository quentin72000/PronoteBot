
const Discord = require("discord.js")

module.exports = {
    name: "info",
    aliases: ["information", "informations"],
    description: "Envoie des informations (comme le lien du site ou l’ip)",
    run: async (client, message, args) => {
    	
        message.channel.send({embed: {
        	title: "Informations:",
           fields: [
            {
            name: "Site",
            value: "[Non disponible](https://www)",
            inline: true,
            },
            {
            name: "Ip du serveur",
            value: "`Pas encore disponible`",
            inline: true,
            
            } 
            

    ] 
    

    
    }})

    }
}