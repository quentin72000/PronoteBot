module.exports = {
    name: "pronote",
    description: "Liste de petite commande qui donne des informations de pronote.",
    type: "CHAT_INPUT",
    options: [{
        name: "version",
        type: "SUB_COMMAND",
        description: "Donne la version du serveur pronote.",
    },
    {
        name: "etablisement",
        type: "SUB_COMMAND",
        description: "Donne le nom et des info sur l'établisment de votre page pronote.",
    }
    ],

    run: async(client, interaction, args) => {
        const session = await client.pronote.login();
        if (args[0] === "version") {
            return interaction.editReply("Version du serveur pronote: " + session.params.version);
        } else if (args[0] === "etablisement") {


            const embeds = [];

            session.user.establishmentsInfo.forEach(etablisement => {
                const adresses = [];
                etablisement.address.forEach(element => { // Loop the establishment array
                    if (element.length !== 0) adresses.push(element);
                });
                adresses.push(etablisement.city, etablisement.country); // Add the city and country to the adresses

                embeds.push({
                    title: "Information sur " + etablisement.name,
                    description: `**Nom**: ${etablisement.name}`
                    + `\n**Adresse**: ${adresses.join(", ")}(${etablisement.postalCode})`
                    + `\n**Site**: [${etablisement.website}](${etablisement.website})`
                });
            });

            interaction.editReply({
                embeds: embeds
            });
        }
        await client.pronote.logout(session, "/pronote");
    }
};