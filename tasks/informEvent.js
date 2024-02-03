const { EmbedBuilder, Colors } = require("discord.js");
const client = require("../index.js");
const { db,config } = client;

module.exports = {
    name: "informEvent",
    run: async function(session) {
        const taskName = "informEvent";
        console.log(`Running the ${taskName} task.`);

        const options = config.tasksConfig.find(e => e.name === taskName).options; // get the options of the task from the config

        const channel = client.channels.cache.get(client.config.channels.announcement);

        const params = session.params;


        /**
         * Inform of the end of the school year and how to make a clean-up
         */
        if (options.endOfSchoolYear === true) {
            const endOfSchoolYear = new Date(params.lastDay);

            if (isToday(endOfSchoolYear)) {
                const embed = new EmbedBuilder()
                    .setTitle("Fin de l'année scolaire")
                    .setDescription("L'année scolaire est terminée ! **Bonne vacances !**"
                        + "\n\n N'oubliez pas de faire **un nettoyage de la base de données** pour préparer la nouvelle"
                        + " année, en utilisant le script `cleanDB.js` dans le dossier `scripts` ! "
                        + "(voir [le readme](https://github.com/quentin72000/PronoteBot#prepare-for-a-new-school-year) "
                        + "pour plus d'informations)")
                    .setColor(Colors.Green);
                channel.send({ embeds: [embed] });
            }
        }


        /**
         * Inform of the start and the end of public holidays
         */
        if (options.holidays === true) {

            const publicHolidays = params.publicHolidays;
            const content = options.pingOnHolidays ? `<@${client.config.notificationUserId}>` : undefined;

            const rows = await db.prepare("SELECT * FROM holidays").all();

            for (let i = 0; i < publicHolidays.length; i++) {

                const value = publicHolidays[i];
                const name = value.name ? value.name : "n'ayant pas de nom";
                const start = new Date(value.from);
                const end = new Date(value.to);
                const diffInDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

                let result = rows.find(e => e.name === (value.name ? value.name : "none")
                    && e.from === start.toISOString()
                    && e.to === end.toISOString());

                if (!result) { // If the holidays is not in the database
                    result = {
                        name: name,
                        from: start.toISOString(),
                        to: end.toISOString(),
                        reminder_before_start: 0,
                        reminder_start: 0,
                        reminder_before_end: 0,
                        reminder_end: 0
                    };
                    await db.prepare("INSERT INTO holidays (\"name\", \"from\", \"to\") VALUES (?, ?, ?)")
                        .run(value.name ? value.name : "none", start.toISOString(), end.toISOString());
                }


                const fields = [];
                if (diffInDays > 0) { // If the holidays are more than one day (not single-day)
                    fields.push({
                        name: "Début",
                        value: "<t:" + Math.floor(start.getTime() / 1000) + ":F> (<t:"
                            + Math.floor(start.getTime() / 1000) + ":R>)"
                    });
                    fields.push({
                        name: "Fin",
                        value: "<t:" + Math.floor(end.getTime() / 1000) + ":F> (<t:"
                            + Math.floor(end.getTime() / 1000) + ":R>)"
                    });
                } else { // Single day holidays
                    fields.push({
                        name: "Date",
                        value: "<t:" + Math.floor(start.getTime() / 1000) + ":F> (<t:"
                            + Math.floor(start.getTime() / 1000) + ":R>)"
                    });
                }


                if ((diffInDays <= 3)) { // If the holidays are "short" holidays, assume it's a national holidays (férié)
                    if (isBefore2Days(start) && result.reminder_before_start === 0) {
                        const embed = new EmbedBuilder()
                            .setTitle(diffInDays > 0 ?
                                `Les jours férié \`${name}\` approchent !`
                                : `Le jour férié \`${name}\` approche !`)
                            .setDescription((diffInDays > 0 ?
                                `Les jours férié \`${name}\` vont`
                                : `Le jour férié \`${name}\` va `)
                            + `commencer **dans 2 jours** (<t:${Math.floor((start.getTime() / 1000))}:R>) !`)
                            .setColor(Colors.Green)
                            .addFields(fields);

                        channel.send({ embeds: [embed], content: content });
                        await db.prepare("UPDATE holidays SET reminder_before_start = 1 WHERE name =? AND \"from\" =?")
                            .run(value.name ? value.name : "none", start.toISOString());
                    }

                    if (isToday(start) && result.reminder_start === 0) {
                        const embed = new EmbedBuilder()
                            .setTitle(diffInDays > 0 ? `Les jours férié \`${name}\` ont commencé !`
                                : `Le jour férié \`${name}\` a commencé !`)
                            .setDescription(diffInDays > 0 ? `Les jours férié \`${name}\` ont commencé !
                                \n\n**Bon jours férié !**`
                                : `Le jour férié \`${name}\` a commencé ! \n\n**Bon jour férié !**`)
                            .setColor(Colors.DarkGreen)
                            .addFields(fields);

                        await channel.send({ embeds: [embed], content: content });
                        await db.prepare("UPDATE holidays SET reminder_start = 1 WHERE name =? AND \"from\" =?")
                            .run(value.name ? value.name : "none", start.toISOString());
                    }

                    if (diffInDays >= 1 && isToday(end) && result.reminder_end === 0) {
                        const embed = new EmbedBuilder()
                            .setTitle(`Les jours férié \`${name}\` sont terminés !`)
                            .setDescription(`Les jours férié \`${name}\` sont terminés ! \n\n**Bonne rentrée !**`)
                            .setColor(Colors.DarkOrange)
                            .addFields(fields);

                        await channel.send({ embeds: [embed], content: content });
                        await db.prepare("UPDATE holidays SET reminder_end = 1 WHERE name =? AND \"from\" =?")
                            .run(value.name ? value.name : "none", start.toISOString());
                    }

                } else { // If the holidays is a school holidays

                    if (isBefore2Days(start) && result.reminder_before_start === 0) {
                        const embed = new EmbedBuilder()
                            .setTitle("Le début des vacances approche !")
                            .setDescription(`Les vacances \`${name}\` vont commencer **dans 2 jours** `
                            + `(<t:${Math.floor(start.getTime() / 1000)}:R>) ! \n\n**Bonne fin de semaine !**`)
                            .setColor(Colors.Green)
                            .addFields(fields);

                        await channel.send({ embeds: [embed], content: content });
                        await db.prepare("UPDATE holidays SET reminder_before_start = 1 WHERE name =? AND \"from\" =?")
                            .run(value.name ? value.name : "none", start.toISOString());
                    }

                    if (isToday(start) && result.reminder_start === 0) {
                        const embed = new EmbedBuilder()
                            .setTitle("Début des vacances")
                            .setDescription(`Les vacances \`${name}\` ont commencé ! \n**Bonne vacances !**`)
                            .setColor(Colors.DarkGreen)
                            .addFields(fields);

                        await channel.send({ embeds: [embed], content: content });
                        await db.prepare("UPDATE holidays SET reminder_start = 1 WHERE name =? AND \"from\" =?")
                            .run(value.name ? value.name : "none", start.toISOString());
                    }

                    if (isBefore2Days(end) && result.reminder_before_end === 0) {
                        const embed = new EmbedBuilder()
                            .setTitle("La fin des vacances approche !")
                            .setDescription(`Les vacances \`${name}\` vont se terminer **dans 2 jours** `
                                + `(<t:${Math.floor(end.getTime() / 1000)}:R>) ! \n\n`
                                + "**N'oubliez pas de faire vos devoirs !**")
                            .setColor(Colors.Orange)
                            .addFields(fields);

                        await channel.send({ embeds: [embed], content: content });
                        await db.prepare("UPDATE holidays SET reminder_before_end = 1 WHERE name =? AND \"from\" =?")
                            .run(value.name ? value.name : "none", start.toISOString());
                    }

                    if (isToday(end) && result.reminder_end === 0) {
                        const embed = new EmbedBuilder()
                            .setTitle("Fin des vacances")
                            .setDescription(`Les vacances \`${name}\` sont terminées ! \n\n**Bonne rentrée !**`)
                            .setColor(Colors.DarkOrange);

                        await channel.send({ embeds: [embed], content: content });
                        await db.prepare("UPDATE holidays SET reminder_end = 1 WHERE name =? AND \"from\" =?")
                            .run(value.name ? value.name : "none", start.toISOString());
                    }
                }
            }

        }

    }
};


function isBefore2Days(date) {
    const now = new Date();
    const diffInMs = Math.abs(date - now);
    const diffInDays = diffInMs / 86400000;
    return (diffInDays >= 1 && diffInDays <= 2);
}

function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate()
      && date.getMonth() === today.getMonth()
      && date.getFullYear() === today.getFullYear();
}
