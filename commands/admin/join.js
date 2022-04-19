module.exports = {
  name: "join",
  descrition: "simule un join",
  run: async (client, message, args) => {
    try{
    client.emit('guildMemberAdd', message.member)
    message.reply("simulation en cours !")
    } catch (error){
      console.error(error)
    }
  }
}