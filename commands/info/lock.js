module.exports = {
	name: "lock",
	inDev: false,
	execute (message, args) {
		
		if(!args.length) {
		
		    const role = message.guild.roles.cache.find(r => r.id === "866239726087045160");

            message.channel.updateOverwrite(role,{ 'SEND_MESSAGES': false })
            message.channel.send({embed: {
                title: ":lock: Channel verrouillé avec succès !\nPour l'unlock faites `l!lock unlock`",
                color: "#D58F00"
            }});
        }
        
        if(args[0] === "unlock"){
        	const role = message.guild.roles.cache.find(r => r.id === "866239726087045160");
            
            message.channel.updateOverwrite(role,{ 'SEND_MESSAGES': true })
            message.channel.send({embed: {
                title: ":unlock: Channel dévérouillez avec succès !",
                color: "#D58F00"
            }})

}


     }
}