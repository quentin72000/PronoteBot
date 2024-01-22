const client = require("../index.js");

const { db,config } = client;

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, RESTJSONErrorCodes, Colors } = require("discord.js");


module.exports = {
    run: async function() {
        const taskName = "updateTimetable";

        console.log(`Running the ${taskName} task.`);
        const session = await client.pronote.login();

        const options = config.tasksConfig.find(e => e.name === taskName).options; // get the options of the task
        const content = options.pingOnTimetableChange ? `<@${config.notificationUserId}>` : null;

        // Taked and edited from https://github.com/Gamers-geek/PronoteBot/blob/master/events/ready.js

        const timetableChannel = await client.channels.cache.get(config.channels.timetable);
        if (!timetableChannel) throw new Error("Can't find timetable channel. Please check your config.");
        const timetableMsg = await getTimetableMessage(timetableChannel);

        const absentChannel = await client.channels.cache.get(config.channels.timetableChange);

        await session.timetable().then(async(timetable) => {
            await client.pronote.logout(session, taskName);

            // Timetable embed update part
            const timetableEmbed = new EmbedBuilder()
                .setColor("#0099ff");
            timetableEmbed.setTimestamp();
            timetableEmbed.setFooter({ text: "Mis à jour le: " });

            if (timetable.length === 0) {
                timetableEmbed.setTitle("Aucun cours n'est prévu aujourd'hui");
                timetableMsg.edit({ embeds: [timetableEmbed] });
            } else {
                timetable = timetable.sort((a,b) =>a.from.getTime() - b.from.getTime());
                timetableEmbed.setTitle(`Emploi du temps du <t:${Math.floor(timetable[0].from / 1000)}:d>`);
                for (let i = 1; i < timetable.length; i++) { // Remove courses of the next day
                    const cour = timetable[i];
                    if (new Date(cour.from).getDate() !== new Date(timetable[0].from).getDate()) {
                        timetable.length = i;
                        break;
                    }
                }

                const result = db.prepare("SELECT * FROM changementedt").all();

                timetable.map(cours => {
                    const conditionAbsent = cours.status === "Prof. absent" || cours.status === "Prof./pers. absent";
                    const conditionAnnule = cours.status === "Cours annulé";/* && cours.hasDuplicate === false*/
                    const coursDate = new Date(cours.from);

                    if (cours.status !== "Cours annulé" || cours.hasDuplicate !== true) { // filter duplicates
                        timetableEmbed.addFields([{
                            name: conditionAbsent ? `❌ __Prof. absent__ : ${cours.subject}`
                                : conditionAnnule ? `❌ __Cours annulé__ : ${cours.subject}`
                                    : `✅ ${cours.subject}`,
                            value: conditionAbsent || conditionAnnule ?
                                `~~**Salle :** ${cours.room ? cours.room : "Aucune salle précisé."}\n`
                                + `**Professeur :** ${cours.teacher}\n`
                                + `**Début :** <t:${Math.floor(coursDate / 1000)}:F>~~`

                                : `**Salle :** ${cours.room ? cours.room : "Aucune salle précisé."}\n`
                                + `**Professeur :** ${cours.teacher}\n`
                                + `**Début :** <t:${Math.floor(coursDate / 1000)}:t>`
                        }]);

                        // Notifications part

                        if (result.some(value => value.id === cours.id)) return null; // If already sent, stop
                        const sqlInsertStm = db.prepare("INSERT INTO changementedt VALUES (?, ?, ?, ?, ?)");
                        if (conditionAbsent || conditionAnnule) {
                            const embed = new EmbedBuilder();
                            if (conditionAbsent) {
                                embed.setTitle(`__Professeur absent__ : ${cours.teacher}`)
                                    .setDescription(`**Salle :** ${cours.room ? cours.room
                                        : "Aucune salle précisé."}\n**Date :** <t:${Math.floor(coursDate / 1000)}:F>`)
                                    .setColor(Colors.Red);
                            }
                            else {
                                embed.setTitle(`__Cours annulé__ : ${cours.teacher}`)
                                    .setDescription(`**Salle :** ${cours.room ? cours.room
                                        : "Aucune salle précisé."}\n**Date :** <t:${Math.floor(coursDate / 1000)}:F>`)
                                    .setColor(Colors.Red);
                            }

                            absentChannel.send({ embeds: [embed], content: content });
                            sqlInsertStm.run(cours.id,
                                coursDate.getTime() / 1000,
                                cours.teacher,
                                cours.subject,
                                cours.status);
                        }
                    }
                    return null;
                });
                timetableMsg.edit({ embeds: [timetableEmbed] }).catch((err) => {
                    if (err.code === RESTJSONErrorCodes.MissingPermissions) {
                        throw new Error("Can't edit the timetable message. The bot don't have the right permission.");
                    }
                    throw new Error("Can't edit the timetable message. Please check your config or bot permissions.");
                });
            }
        });

    },
    task: {
        cron: "*/10 * * * *", // https://crontab.guru
        // cron: "* * * * *", // testing purpose
        runOnStartup: true, // if true, the task will be run on startup of the bot
        name: "updateTimetable"
    }
};

async function createTimetableMsg(timetableChannel) {
    console.log("Timetable message not found... (re)creating...");

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("refresh_timetable")
                .setLabel("Actualiser l'emploi du temps")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🔄"),
        );
    const embed = new EmbedBuilder()
        .setTitle("Emploi du temps.")
        .setDescription("Initialisation...");

    const message = await timetableChannel.send({ embeds: [embed], components: [row] }).catch((err) => {
        if (err.code === RESTJSONErrorCodes.MissingPermissions) {
            throw new Error("Can't send the timetable message. The bot don't have the right permission.");
        }
        throw new Error("Can't send the timetable message. Please check your config or bot permissions.");
    });
    await db.prepare("INSERT OR REPLACE INTO config (name, value) VALUES (?, ?)").run("timeTableMsgID", message.id);

    return message;
}

async function getTimetableMessage(timetableChannel) {
    const timetableMsgID = await db.prepare("SELECT * FROM config WHERE name=?").get("timeTableMsgID");
    if (!timetableMsgID) {
        return createTimetableMsg(timetableChannel);
    }

    let message;
    try {
        message = await timetableChannel.messages.fetch({ message: timetableMsgID.value, cache: false, force: true });
    } catch (err) {
        return createTimetableMsg(timetableChannel);
    }

    if (message) {
        return message;
    }

}
