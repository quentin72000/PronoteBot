module.exports = {
	name: "button",
	run: async (client, message, args) => {
		const { MessageButton, MessageActionRow } = require("discord-buttons");
		let stopButton = new MessageButton()
    .setLabel("Stop")
    .setStyle("red")
    .setEmoji("🚫")
    .setID("action_stop");
    
let startButton = new MessageButton()
     .setStyle("green")
    .setLabel("Start")
    .setEmoji("▶️")
    .setID("action_start");

let restartButton = new MessageButton()
     .setStyle("blurple")
    .setLabel("Restart")
    .setEmoji("🔁")
    .setID("action_restart");
 //   .setID("test")
let panelLinkButton = new MessageButton()
    .setStyle("url")
    .setURL("https://ptero.minestrator.com/server/9a4922f6")
    .setLabel("Panel Link")
    .setEmoji("🎮");


let buttonRow = new MessageActionRow()
    .addComponent(stopButton)
    .addComponent(startButton)
    .addComponent(restartButton)
    .addComponent(panelLinkButton);

message.channel.send("Cliquez sur un des bouton pour faire une action !", { component: buttonRow });
  }
}