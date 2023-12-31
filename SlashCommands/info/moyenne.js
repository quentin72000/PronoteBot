const { ApplicationCommandType, EmbedBuilder, Colors } = require("discord.js");
module.exports = {
    name: "moyenne",
    description: "Renvoie la moyenne stocker dans la base de donées ou mis à jours si préciser.",
    type: ApplicationCommandType.ChatInput,

    run: async(client, interaction) => {
        const session = await client.pronote.login();
        session.marks().then(async(marks)=>{
            await client.pronote.logout(session, "/moyenne");
            const moyenne = marks.averages;
            let color;

            if (moyenne.student > 15.5) color = "#0E6C38";
            else if (moyenne.student > 12) color = Colors.Green;
            else if (moyenne.student > 9) color = Colors.Orange;
            else color = Colors.Red;

            await interaction.editReply({ embeds: [new EmbedBuilder()
                .setTitle("Moyennes")
                .addFields({
                    name: "Moyenne de l'élève",
                    value: moyenne.student ? moyenne.student + "/20" : "Aucune note dans la période actuelle."
                },
                {
                    name: "Moyenne de la classe",
                    value: moyenne.studentClass ? moyenne.studentClass + "/20" : "Aucune note dans la période actuelle."
                })
                .setColor(color)]
            });
        });
    }
};