const moment = require("moment");
require("moment-duration-format");
const Discord = require('discord.js')


module.exports = {
    name: 'uptime',
    execute (message, config) {
        

const duration = moment.duration(message.client.uptime).format(" D [jours(s)], H [heure(s)], m [minute(s)], s [seconde(s)]");

      const embed = new Discord.MessageEmbed()
        .setTitle(`Uptime: ${duration}`)
        .setColor('0A9CD4')
        message.channel.send(embed);
        
      /*  
        let result;
       var net = require('net');
       var hosts = [['google.com', 80], ['stackoverflow.com', 80], ['google.com', 444]];
       hosts.forEach(function(item) { 
       var sock = new net.Socket();
       sock.setTimeout(2500);
       sock.on('connect', function() { 
           console.log(item[0]+':'+item[1]+' is up.');
           result.ALL = item[0] + "est up"
           sock.destroy();
       }).on('error', function(e) { 
            console.log(item[0]+':'+item[1]+' is down: ' + e.message); 
            result.ALL = item[0] + "est down"

      }).on('timeout', function(e) { 
     console.log(item[0]+':'+item[1]+' is down: timeout');
     result.ALL = item[0] + "est down: timeout"
     }).connect(item[1], item[0]); });
     
     //message.reply(result)
     console.log(result)
     */
    }
}