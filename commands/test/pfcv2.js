const Discord= require("discord.js");
module.exports = {
	name: "pfcv2",
	description: "jouer aux pierre, feuilles, ciseaux !",
	run: async (client, message, args) => {
		var select;
   
    if (!args.length){
    	sendChoose(select, message, ) 
    

}
  else if (args[0] != 'p' && args[0] != 'f' && args[0] != 'c') {
    message.reply('Ceci n’est pas un argument valide ! Choisissez entre `p`, `f` ou `c`.') // envoie un message lors qu'un args invalide est fournit
      .then((msg) => msg.delete({timeout: 5000}))
      .catch(err => console.error(err));
    return;
  }else if(args[0] === 'p' || args[0] === 'f' || args[0] === 'c'){  select = args[0];
  console.log(select)
  }
 
  var playerV;
  var player;

  var meV = randomInt(0, 2);
  var me;
  console.log(meV)

  switch (select) {
    case 'p':
      player = ':rock: pierre'
      playerV = 0;
      break;
    case 'f':
      player = ':page_facing_up:feuilles'
      playerV = 1;
      break;
    case 'c':
      player = ':scissors: ciseaux'
      playerV = 2;
      break;
  }
  switch (meV) {
    case 0:
      me = ':rock: pierre'
      break;
    case 1:
      me = ':page_facing_up:feuilles'
      break;
    case 2:
      me = ':scissors: ciseaux'
      break;
  }
  console.log("test")
  let result= {
  title: "🎖 Resultat:",
  description: "Votre choix: " + player
  + "\nMon choix: " + me
}
  if (meV == playerV) {
 //   message.channel.send(`Vous avez choisi ${player}, et j’ai choisi ${me}. Égalité !`);
    result.description += "\n\nÉgalité !";
    result.color = "#B3B3B3";
    message.channel.send({embed: result})
   
  }

  if (meV == eClamp(playerV + 1, 0, 2)) {
  //  message.channel.send(`Vous avez choisi ${player}, et j’ai choisi ${me}. J’ai gagné !`);
    result.description += "\n\nJ’ai gagné !";
    result.color = "#E55700";
    message.channel.send({embed: result})
  }

  if (meV == eClamp(playerV - 1, 0, 2)) {
//    message.channel.send(`Vous avez choisi ${player}, et j’ai choisi ${me}. Vous avez gagné!`);
    result.description += "\n\nVous avez gagné !";
    result.color = "#00E60F";
    message.channel.send({embed: result})
  }
  
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function eClamp(value, min, max) {
  if (value < min)
    value = max;

  if (value > max)
    value = min;

  return value;
};
function sendChoose(select, message){
	message.channel.send({embed: {title: "chosisez la reac" }}).then(m => {
    	m.react("✊").then(()=> {
    	m.react("❌").then(()=> {
    	m.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '✊' || reaction.emoji.name == '❌'),
                            { max: 1, time: 30000 }).then(collected => {
                            	m.delete();
                            console.log(collected.first().emoji.name)
                                    if (collected.first().emoji.name == '✊') {
                                            select = "p";
                                            console.log("react " + select)
                                    }
                                    
                            }).catch((err) => {
                            	console.error(err)
                                    message.reply('Aucune reaction apres 30sec, operation annulé');
                            });
                            }).then(()=>{
                            	return select;

})})})
}
}
}