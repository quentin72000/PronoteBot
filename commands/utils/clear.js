module.exports = {
  name: 'clear',
  description: 'suprime le nombres de messages demandés.',
  guildOnly: true,
  run: async (client, message, args) => {
    errors = client.errors
    fonction = client.fonction

      if (!message.member.hasPermission('MANAGE_MESSAGES')) return errors.noPerms(message, 'MANAGE_MESSAGES');
    const amount = parseInt(args[0]) + 1;
    

    if (isNaN(amount)) {
      message.react('❌');
      return errors.otherError(message, "Ce n’est pas un nombre valide !");
       
      
    }
    else if (amount <= 1 || amount > 100) {
      message.react('❌');
      return errors.otherError(message, "Vous devez saisir un nombre entre 1 et 99 !");
    }

    message.channel.bulkDelete(amount, {filterOld: true})
    
      .then(messages => {
      
      client.log(`${messages.size - 1} messages supprimés par ${message.author.tag} dans ${message.channel.name}.`)
      message.reply(`Message(s) supprimé ! (${messages.size - 1})`).then(reply => reply.delete({timeout: 15 * 1000}))
      fonction.logEmbed(message, "La commande `clear` a été éffectué par `" + message.author.tag + "`:", `Dans: ${message.channel}\nNombre(s) de message(s) suprimée(s): ${messages.size - 1}`, "FE8801")
      // fonction.log(message, `${messages.size - 1} messages supprimés par ${message.author} dans ${message.channel}`)
      
    })// `${messages.size - 1} messages supprimés par ${message.author} dans ${message.channel}`)
    .catch(console.error)
  }
};