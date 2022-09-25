module.exports = {
	name: "eval",
	async run(client, message, args) {
		if (!args[0]) return message.reply("**:x: | " + client.config.prefix + "eval**");
		let content = args.join(" ");
		if (content.includes(client.token)) content = content.replaceAll(client.token, "TOK3N");
		if (content.includes("process.env")) return message.channel.send("For security reasons, you are not allowed to use process.env.")
		const result = new Promise((resolve, reject) => resolve(eval(content)));
		return result.then(output => {
			if (typeof output !== 'string') output = require('util').inspect(output, {depth: 0})
			if (output.includes(client.token)) output = output.replaceAll(client.token, "TOK3N");
			if (output.includes(process.env.PASSWORD)) output = output.replaceAll(process.env.PASSWORD, "PASSWORD");
			if (content.includes("message.channel.delete()")) {
				message.author.send("```" + output + "```");
				return;
			}
			return message.channel.send("```" + output + "```");
		}).catch(err => {
			if (err) {
				err = err.toString();
				if (err.includes(client.token)) err = err.replaceAll(client.token, "TOK3N");
				if (err.includes(process.env.PASSWORD)) err = err.replaceAll(process.env.PASSWORD, "PASSWORD");

				return message.channel.send("```" + err + "```");
			}
		})
	}
}