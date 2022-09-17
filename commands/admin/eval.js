module.exports = {
	name: 'eval',
	run: async (client, message, args) => {
    if(message.author.id !==  message.client.config.owner_id) return;
    let content = message.content.split(" ").slice(1).join(" ");
       if (content.includes("config.db")) content.replace("config.db", "NOP");
       if (content.includes("config.token")) content.replace("config.token", "NOP")
       if (content.includes("config.token")) content.replace("config.token", "NOP")
        const result = new Promise((resolve, reject) => resolve(eval(content)));
        
        return result.then((output) => {
            if(typeof output !== "string"){
                output = require("util").inspect(output, { depth: 0 });
            }
            if(output.includes(client.token)){
                output = output.replace(message.client.token, "T0K3N");
            }
            message.channel.send(output, {
                code: "js"
            });  
        }).catch((err) => {
            err = err.toString();
            if(err.includes(message.client.token)){
                err = err.replace(message.client.token, "T0K3N");
            }
            message.channel.send(err, {
                code: "js"
            });
        });
  }
}
 
