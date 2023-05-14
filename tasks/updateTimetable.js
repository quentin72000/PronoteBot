let client = require("../index.js")

let {db,config} = client;

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')


module.exports = {
    run: async function () {
        let taskName = "updateTimetable"

        console.log(`Running the ${taskName} task.`)
        let session = await client.pronote.login()

        let options = config.tasksConfig.find(e => e.name === taskName).options // get the options of the task from the config
        let content = options.pingOnTimetableChange ? `<@${config.notificationUserId}>` : null
        // Taked and edited from https://github.com/Gamers-geek/PronoteBot/blob/master/events/ready.js

        const timetableChannel = await client.channels.cache.get(config.channels.timetable);
        const timetableMsg = await new Promise(async(resolve, reject) => { // Message creation system
        let timetableMsgID = await db.prepare(`SELECT * FROM config WHERE name=?`).get("timeTableMsgID")

        if(!timetableMsgID) resolve(await createTimetableMsg(db, timetableChannel))
        else {
            let message = await timetableChannel.messages.fetch(timetableMsgID.value).catch(async(err) => { // If message not found, recreate it
                resolve(await createTimetableMsg(db, timetableChannel))
            })

            if(message) resolve(message)
        }
    })
        

        const absentChannel = await client.channels.cache.get(config.channels.timetableChange)


        await session.timetable().then(async(timetable) => new Promise(async(resolve, reject) => {
            await client.pronote.logout(session, taskName)
            
            // Timetable embed update part
            const timetableEmbed = new MessageEmbed()
                .setColor('#0099ff')
                timetableEmbed.setTimestamp()
                timetableEmbed.setFooter({ text: `Mis à jour le: `})
            if (timetable.length === 0) {
                timetableEmbed.setTitle(`Aucun cours n'est prévu aujourd'hui`)   
                resolve(timetableEmbed)
            }else {
                timetable = timetable.sort((a,b) =>a.from.getTime()-b.from.getTime())

                let result = db.prepare("SELECT * FROM changementedt").all()
                    
                timetable.map(cours => {
                    
                    let conditionAbsent = cours.status === "Prof. absent" || cours.status === "Prof./pers. absent"
                    let conditionAnnule = cours.status === "Cours annulé" /*&& cours.hasDuplicate === false*/
                    const coursDate = new Date(cours.from)
                    timetableEmbed.setTitle(`Emploi du temps du <t:${Math.floor(coursDate / 1000)}:d>`)

                    if(cours.status !== "Cours annulé" || cours.hasDuplicate !== true){ // filter duplicates of cours annulé to avoid confusion and false alert
                        timetableEmbed.addFields([{
                            name: conditionAbsent ? `❌ __Prof. absent__ : ${cours.subject}` : conditionAnnule ? `❌ __Cours annulé__ : ${cours.subject}` :`✅ ${cours.subject}`,
                            value: conditionAbsent || conditionAnnule ? `~~**Salle :** ${cours.room ? cours.room : "Aucune salle précisé."}\n**Professeur :** ${cours.teacher}\n**Début :** <t:${Math.floor(coursDate / 1000)}:F>~~` : `**Salle :** ${cours.room ? cours.room : "Aucune salle précisé."}\n**Professeur :** ${cours.teacher}\n**Début :** <t:${Math.floor(coursDate / 1000)
                        }:t>` }])
    
                        // Notifications part

                        if(result.some(value => {if(value.id === cours.id)return true;}))return; // If already sended, stop
                        let sqlInsertStm = db.prepare(`INSERT INTO changementedt VALUES (?, ?, ?, ?, ?)`)
                        if (conditionAbsent) {
                            const embed = new MessageEmbed()
                                .setTitle(`__Professeur absent__ : ${cours.teacher}`)
                                .setDescription(`**Salle :** ${cours.room ? cours.room : "Aucune salle précisé."}\n**Date :** <t:${Math.floor(coursDate / 1000)}:F>`)
                                .setColor("RED")
                            absentChannel.send({ embeds: [embed], content: content })
                            sqlInsertStm.run(cours.id, coursDate.getTime()/1000, cours.teacher, cours.subject, cours.status)
                        }
                        else if (conditionAnnule){
                            const embed = new MessageEmbed()
                                .setTitle(`__Cours annulé__ : ${cours.teacher}`)
                                .setDescription(`**Salle :** ${cours.room ? cours.room : "Aucune salle précisé."}\n**Date :** <t:${Math.floor(coursDate / 1000)}:F>`)
                                .setColor("RED")
                            absentChannel.send({ embeds: [embed], content: content })
                            sqlInsertStm.run(cours.id, coursDate.getTime()/1000, cours.teacher, cours.subject, cours.status)
                        }
                    }
                })
                resolve(timetableEmbed)
            }
            

            
        }).then((embed)=> {
            const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('refresh_timetable')
					.setLabel("Actualiser l'emploi du temps")
					.setStyle("SECONDARY")
                    .setEmoji("🔄"),
			);

            timetableMsg.edit({ embeds: [embed], components: [row] })
        }))


    },
    task: {
        cron: "*/10 * * * *", // https://crontab.guru
        // cron: "* * * * *", // testing purpose
        runOnStartup: true, // if true, the task will be run on startup of the bot
        name: "updateTimetable"
    }
};

const createTimetableMsg = (db, timetableChannel) => new Promise(async(resolve, reject) => {
    console.log('Timetable message not found... (re)creating...')

    let message = await timetableChannel.send({embeds: [{
        title: "Emploi du temps.",
        description: "Initialisation..."
    }]})

    if(!message)throw "Can't send timetable message. Please check your config or bot permisions."
    try {
        await db.prepare(`INSERT OR REPLACE INTO config (name, value) VALUES (?, ?)`).run("timeTableMsgID", message.id)
    } catch (error) {
        throw error;
    }
    
    resolve(message)
})