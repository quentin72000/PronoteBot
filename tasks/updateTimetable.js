let client = require("../index.js")

let {db,config} = client;

const { MessageEmbed, Collection, MessageActionRow, MessageButton } = require('discord.js')

const profAbsent = new Collection()



module.exports = {
    run: async function () {
        let taskName = "updateTimetable"

        console.log(`Running the ${taskName} task.`)
        let session = await client.pronote.login()

        // Taked and edited from https://github.com/Gamers-geek/PronoteBot/blob/master/events/ready.js

        const timetableChannel = await client.channels.cache.get(config.channels.timetable);
        const timetableMsg = await new Promise(async(resolve, reject) => {
            await db.get(`SELECT * FROM config WHERE name="timeTableMsgID"`, async(err, result) => {
                if(err) throw err;
                
                if(!result)resolve(await createTimetableMsg(db, timetableChannel))
                else {
                    let message = await timetableChannel.messages.fetch(result.value).catch(async(err) => {
                        resolve(await createTimetableMsg(db, timetableChannel, true))
                    })
                    if(message)resolve(message)
                }
            })
        })
        
        const absentChannel = await client.channels.cache.get(config.channels.timetableChange)


        await session.timetable().then(async(timetable) => {
            await client.pronote.logout(session, taskName)
            
            // Timetable embed update part
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                embed.setTimestamp()
                embed.setFooter({ text: `Mis à jour le: `})
            if (timetable.length === 0) {
                embed.setTitle(`Aucun cours n'est prévu aujourd'hui`)
                
            }
            timetable.map(cours => {
                let conditionAbsent = cours.status === "Prof. absent" || cours.status === "Prof./pers. absent"
                let conditionAnnule = cours.status === "Cours annulé" /*&& cours.hasDuplicate === false*/
                const coursDate = new Date(cours.from)
                // console.log(cours.status !== "Cours annulé" && cours.hasDuplicate === false);
                if(cours.status !== "Cours annulé" || cours.hasDuplicate !== true){ // filter duplicates of cours annulé to avoid confusion and false alert

                    embed.setTitle(`Emploi du temps du ${coursDate.toLocaleDateString()}`)
                    embed.addFields([{
                        name: conditionAbsent ? `❌ __Prof. absent__ : ${cours.subject}` : conditionAnnule ? `❌ __Cours annulé__ : ${cours.subject}` :`✅ ${cours.subject}`,
                        value: conditionAbsent || conditionAnnule ? `~~**Salle :** ${cours.room ? cours.room : "Aucune salle précisé."}\n**Professeur :** ${cours.teacher}\n**Début :** <t:${Math.floor(coursDate / 1000)}:t>~~` : `**Salle :** ${cours.room ? cours.room : "Aucune salle précisé."}\n**Professeur :** ${cours.teacher}\n**Début :** <t:${Math.floor(coursDate / 1000)
                    }:t>` }])

                    // Notifications part

                    if (conditionAbsent) {
                        if (profAbsent.has(cours.id)) return
                        const embed = new MessageEmbed()
                            .setTitle(`__Professeur absent__ : ${cours.teacher}`)
                            .setDescription(`**Salle :** ${cours.room ? cours.room : "Aucune salle précisé."}\n**Début :** <t:${Math.floor(coursDate / 1000)}:t>`)
                            .setColor("RED")
                        absentChannel.send({ embeds: [embed] })
                        profAbsent.set(cours.id, cours.teacher)
                    }
                    else if (conditionAnnule){
                        if (profAbsent.has(cours.id)) return
                        const embed = new MessageEmbed()
                            .setTitle(`__Cours annulé__ : ${cours.teacher}`)
                            .setDescription(`**Salle :** ${cours.room ? cours.room : "Aucune salle précisé."}\n**Début :** <t:${Math.floor(coursDate / 1000)}:t>`)
                            .setColor("RED")
                        absentChannel.send({ embeds: [embed] })
                        profAbsent.set(cours.id, cours.teacher)
                    }
                }
            })

            const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('refresh_timetable')
					.setLabel("Actualiser l'emploi du temps")
					.setStyle("SECONDARY")
                    .setEmoji("🔄"),
			);

            timetableMsg.edit({ embeds: [embed], components: [row] })
        })


    },
    task: {
        cron: "*/10 * * * *", // https://crontab.guru
        // cron: "* * * * *", // testing purpose
        runOnStartup: true, // if true, the task will be run on startup of the bot
        name: "updateTimetable"
    }
};

const createTimetableMsg = (db, timetableChannel, update = false) => new Promise(async(resolve, reject) => {
    console.log('Timetable message not found... (re)creating...')

    let message = await timetableChannel.send({embeds: [{
        title: "Emploi du temps.",
        description: "Initialisation..."
    }]})

    if(!message)throw "Can't send timetable message. Please check your config or bot permisions."
    if(update === true)await db.run(`UPDATE config SET value="${message.id}" WHERE name="timeTableMsgID"`, (err) => {
        if(err) throw err;
    })
    else await db.run(`INSERT INTO config (name, value) VALUES ("timeTableMsgID", "${message.id}")`, (err) => {
        if(err) throw err;
    })
    resolve(message)
})