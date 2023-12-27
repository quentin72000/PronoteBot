module.exports = {
    name: "moyenne",
    description: "Renvoie la moyenne stocker dans la base de donées ou mis à jours si préciser.",
    type: "CHAT_INPUT",

    run: async(client, interaction) => {
        const session = await client.pronote.login();
        session.marks().then(async(marks)=>{
            await client.pronote.logout(session, "/moyenne");
            const moyenne = marks.averages;
            let color;

            if (moyenne.student > 15.5) color = "#0E6C38";
            else if (moyenne.student > 12) color = "GREEN";
            else if (moyenne.student > 9) color = "ORANGE";
            else color = "RED";

            await interaction.editReply({ embeds: [{
                title: "Moyennes",
                fields: [{
                    name: "Moyenne de l'élève",
                    value: moyenne.student ? moyenne.student + "/20" : "Aucune note dans la période actuelle."
                },
                {
                    name: "Moyenne de la classe",
                    value: moyenne.studentClass ? moyenne.studentClass + "/20" : "Aucune note dans la période actuelle."
                }],
                color: color
            }] });
        });
    }
};