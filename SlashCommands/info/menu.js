module.exports = {
    name: "menu",
    description: "Renvoie le menu du jour.",
    type: "CHAT_INPUT",

    run: async(client, interaction) => {
        let embed = {};
        const session = await client.pronote.login();
        session.menu().then(async(menu) => {
            await client.pronote.logout(session, "/menu");
            if (!menu[0]) {
                embed = {
                    title: "Aucun menu disponible aujourd'hui",
                    color: "RED"
                };
            } else {
                embed = {
                    title: "Menu du " + new Date(menu[0].date).toLocaleDateString("fr"),
                    description: ""
                };
                menu[0].meals[0].forEach((value) => {
                    value.forEach((item) =>{
                        embed.description += item.name + "\n";
                    });
                    embed.description += "\n";
                });
            }

            await interaction.editReply({
                embeds: [embed]
            });
        });
    }
};