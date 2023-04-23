const fs = require('fs');
const moment = require('moment');

const path = require('path');
const url = require('url');



let client = require("../index.js")
let {db,config} = client;



const { MessageAttachment, MessageActionRow, MessageButton} = require('discord.js');


module.exports = {
    run: async function () {
        let taskName = "checkHomeWork"

        console.log(`Running the ${taskName} task.`)
        let session = await client.pronote.login()

        let from = new Date();
        from.setDate(from.getDate() - 1)
        let to = new Date(from.getFullYear(), from.getMonth() + 1, from.getDate());

        await session.homeworks(from, to).then(async(homeworks) => { // get homeworks for the next 30 days
            for (let i = 0; i < homeworks.length; i++) {
                const value = homeworks[i];

                var dueDate = moment(value.for);

                let description = value.description.replaceAll('"', '""').replaceAll("'", "''") // Prevent non escaped caracter error.
                
            await db.get(`SELECT * FROM homework WHERE id="${value.id}"`, async (err, result) => {
                    if (err) throw err;

                    if (!result) { // if the homework is not in the db, add it...
                        console.log("Adding a new homework to db...")
                        await getEmbed(value).then(async(embed)=> {
                            await client.channels.cache.get(config.channels.homework).send(embed).then(async (msg) => {
                                await db.run(`INSERT INTO homework (id, matiere, description, date_rendue, date_donne, fait, message_id) VALUES ('${value.id}', '${value.subject}', '${description}', '${value.for.toISOString()}', '${value.givenAt.toISOString()}', 0, ${msg.id})`, (err) => {
                                    if (err) console.error(err)
                                })
                            })
                        })
                        
    
                        
                        
                    } else if ((value.done === true && result.fait === 0) || dueDate.isBefore()) { // si de devoir existe et que le devoir est fait mais n'est pas marqué comme fait dans la db OU que la date pour rendre le devoir est dépassé, update la valeur "fait" à 1 (true) et SUPPRIME le message du channel homework
                        await client.channels.cache.get(config.channels.homework).messages.fetch(result.message_id).then(async (msg) => {
                            msg.delete().then(async () => {
                                await db.run(`UPDATE homework SET fait=1 WHERE id="${result.id}"`, (err) => {
                                    if (err) console.error(err)
                                })
                            })
                        })

                    } else if (value.done === false && result.fait === 1) { // si le devoir est marqué dans la DB comme fait alors qu'il ne l'est pas sur pronote, repostez le message et remetre la valeur fait à 0 (false) dans la DB.
                        await getEmbed(value).then(async(embed) => {
                            await client.channels.cache.get(client.config.channels.homework).send(embed).then(async (msg) => {
                                await db.run(`UPDATE homework SET fait=0, message_id=${msg.id} WHERE id='${value.id}'`)
                            })
                        })
                        
                    }

                })
            }
        }) 
        client.pronote.logout(session, taskName) // Loging out at the end because files can't be access if session is closed.
    },
    task: {
        cron: "*/10 * * * *", // https://crontab.guru
        // cron: "* * * * *", // testing purpose
        runOnStartup: true, // if true, the task will be run on startup of the bot
        name: "checkHomeWork"
    }
};




async function parseFiles(files) {
    let result = {
        files: [],
        parsedLinks: ""
    };
    let links = [];
    
    files.forEach(async (file) => {
        if(file.type === 1){ // If the attachment is a file.
            result.files.push(new MessageAttachment(file.url, file.name))
        } else if (file.type === 0) { // If the attachment is a link, parse it to discord
            links.push(`[${file.name ? file.name : file.url}](${file.url})`)
        } 
    })
    result.parsedLinks = links.join("\n") // Join all the links in one string

    return result;
}


async function getEmbed(homework) {

    let options = config.tasksConfig.find(e => e.name === "checkHomeWork").options // get the options of the task from the config


    var givenDate = moment(homework.givenAt);
    var dueDate = moment(homework.for);
    const promise = new Promise(async (resolve, reject) => {
        await parseFiles(homework.files).then((files) => {
            let content = {
                embeds: [{
                    title: "Travail en " + homework.subject + " à rendre pour le " + `<t:${dueDate.unix()}:d>`,
                    description: homework.description ? homework.description : "",
                    color: config.colors[homework.subject] ? config.colors[homework.subject] : homework.color,
                    fields: [{
                            name: "Donné le ",
                            value: `<t:${givenDate.unix()}:D>(<t:${givenDate.unix()}:R>)`,
                            // inline: true
                        },
                        {
                            name: "Pour le",
                            value: `<t:${dueDate.unix()}:D>(<t:${dueDate.unix()}:R>)`,
                            // inline: true
                        } 
                    ]
                }],
                components: [new MessageActionRow().addComponents(new MessageButton()
                    .setCustomId("homework_done")
                    .setLabel("Fait")
                    .setStyle("SUCCESS")
                    .setEmoji("✅"))
                ],
                content: options.pingOnNewHomeWork ? `<@${config.notificationUserId}>` : null
            }

            if(files.files.length !== 0)content.files = files.files // add the files attachments to the messages
            if(files.parsedLinks){ // Add the links to the embeds if there are.
                content.embeds[0].footer = {text: "\n\n ⚠️ Certains liens ne marcheront peut-être pas si vous n'êtes pas connecter. Veuillez vous connecter à Pronote directement pour y accéder."}
                content.embeds[0].fields.push({
                    name: "Liens: ",
                    value: files.parsedLinks
                })
            }
            resolve(content)
        })
    })
    return promise

}