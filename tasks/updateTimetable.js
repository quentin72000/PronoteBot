let client = require("../index.js")

let {db,config} = client;

const { MessageEmbed, Collection } = require('discord.js')
const profAbsent = new Collection()


module.exports = {
    run: async function () {
        console.log("Running the updateTimetable task")
        session = client.session
        // Taked from https://github.com/Gamers-geek/PronoteBot/blob/master/events/ready.js
        const timetableChannel = await client.channels.cache.get(config.channels.timetable);
        console.log(timetableChannel);
        const timetableMsg = await timetableChannel.messages.fetch(config.channels.timetableMsg)
        const absentChannel = client.channels.cache.get(config.channels.timetableChange)

        

        session.timetable(new Date(2022, 9, 20)).then(timetable => {

            // Timetable embed update part
            const embed = new MessageEmbed()
                .setColor('#0099ff')
            if (timetable.length === 0) {
                embed.setDescription(`Aucun cours n'est prévu aujourd'hui`)
            }
            timetable.map(cours => {
                let conditionAbsent = cours.status === "Prof. absent" || cours.status === "Prof./pers. absent"
                let conditionAnnule = cours.status === "Cours annulé" /*&& cours.hasDuplicate === false*/
                const coursDate = new Date(cours.from)
                console.log(cours.status !== "Cours annulé" && cours.hasDuplicate === false);
                if(cours.status !== "Cours annulé" || cours.hasDuplicate !== true){ // filter duplicates of cours annulé to avoid confusion and false alert

                    embed.setTitle(`Emploi du temps du ${coursDate.toLocaleDateString()}`)
                    embed.addFields([{
                        name: conditionAbsent ? `❌ __Prof. absent__ : ${cours.subject}` : conditionAnnule ? `❌ __Cours annulé__ : ${cours.subject}` :`✅ ${cours.subject}`,
                        value: conditionAbsent || conditionAnnule ? `~~**Salle :** ${cours.room ? cours.room : "Aucune salle précisé."}\n**Professeur :** ${cours.teacher}\n**Début :** <t:${Math.floor(coursDate / 1000)}:t>~~` : `**Salle :** ${cours.room ? cours.room : "Aucune salle précisé."}\n**Professeur :** ${cours.teacher}\n**Début :** <t:${Math.floor(coursDate / 1000)
                    }:t>` }])
                    embed.setTimestamp()
                    embed.setFooter({ text: `Mis à jour le: `})
                    // console.log(conditionAbsent)

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
            timetableMsg.edit({ embeds: [embed] })
        })


    },
    task: {
        cron: "*/10 * * * *", // https://crontab.guru
        // cron: "* * * * *", // testing purpose
        runOnStartup: true, // if true, the task will be run on startup of the bot
        name: "updateTimetable"
    }
};