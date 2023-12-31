const { ApplicationCommandType, EmbedBuilder, Colors } = require("discord.js");
module.exports = {
    name: "menu",
    description: "Renvoie le menu du jour.",
    type: ApplicationCommandType.ChatInput,

    run: async(client, interaction) => {
        const embed = new EmbedBuilder();
        const session = await client.pronote.login();
        session.menu().then(async(menu) => {
            await client.pronote.logout(session, "/menu");
            if (!menu[0]) {
                embed.setTitle("Aucun menu disponible aujourd'hui")
                    .setColor(Colors.Red);
            } else {
                let description = "";
                menu[0].meals[0].forEach((value) => {
                    value.forEach((item) =>{
                        description += item.name + "\n";
                    });
                    description += "\n";
                });

                embed.setTitle("Menu du " + new Date(menu[0].date).toLocaleDateString("fr"))
                    .setDescription(description);
            }

            await interaction.editReply({ embeds: [embed] });
        });
    }
};