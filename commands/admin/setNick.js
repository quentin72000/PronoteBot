module.exports ={
	name: "setNick",
	description: "permet de modifier/mettre le/un surnom d’un utilisateur",
	inDev: true,
	 execute (message, args)  {
      let member = message.mentions.members.first();

   try{

		//await member.setNickname(args[1]);
		message.channel.send(member.displayName + "is a cool guy");
	
       } catch (e) {
          console.error(e); // It's always useful to log your errors.
          return message.channel.send("Something went wrong when running this command!");
       }
      
     }
}