const fs = require('fs');
const moment = require('moment');
const axios = require('axios'); 
const path = require('path');


let client = require("../index.js")
let {db,config} = client;



const { MessageAttachment, Message, MessageEmbed } = require('discord.js');


module.exports = {
    run: async function () {
        let taskName = "checkHomeWork"

        console.log(`Running the ${taskName} task.`)
        let session = await client.pronote.login()

        let from = new Date();
        let to = new Date(from.getFullYear(), from.getMonth() + 1, from.getDate());

        await session.homeworks(from, to).then(async(homeworks) => { // get homeworks for the next 30 days
            for (let i = 0; i < homeworks.length; i++) {
                const value = homeworks[i];
                // date to timestamp
                var givenDate = moment(value.givenAt);
                var dueDate = moment(value.for);

                let description = value.description.replaceAll('"', '""').replaceAll("'", "''") // Prevent non escaped caracter error.
                
            await db.get(`SELECT * FROM homework WHERE id="${value.id}"`, async (err, result) => {
                    if (err) throw err;

                    if (!result) { // si le devoir n'est pas dans la db, continuez
                        console.log("Adding a new homework to db...")
                        await getEmbed(value, dueDate, givenDate).then(async(embed)=> {
                            console.log(embed);
                            await client.channels.cache.get(config.channels.homework).send(embed).then(async (msg) => {
                                await db.run(`INSERT INTO homework (id, matiere, description, date_rendue, date_donne, fait, message_id) VALUES ('${value.id}', '${value.subject}', '${description}', '${value.for.toISOString()}', '${value.givenAt.toISOString()}', 0, ${msg.id})`, (err) => {
                                    if (err) console.error(err)
                                })
                            })
                        })
                        
    
                        
                        
                    } else if ((value.done === true && result.fait === 0) || dueDate.isBefore()) { // si de devoir existe et que le devoir est fait mais n'est pas marqué comme fait dans la db OU que la date pour rendre le devoir est dépassé, update la valeur "fait" à 1 (true) et SUPPRIME le message du channel homework
                        await client.channels.cache.get(config.channels.homework).messages.fetch(result.message_id).then(async (msg) => {
                            msg.delete().then(async () => {
                                await db.run(`UPDATE homework SET fait=1 WHERE id=${result.id}`, (err) => {
                                    if (err) console.error(err)
                                })
                            })
                        })

                    } else if (value.done === false && result.fait === 1) { // si le devoir est marqué dans la DB comme fait alors qu'il ne l'est pas sur pronote, repostez le message et remetre la valeur fait à 0 (false) dans la DB.
                        await getEmbed(value, dueDate, givenDate).then(async(embed) => {
                            console.log(2);
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
    
    
    let promise = files.map(async (file) => {
        let ext = path.parse(file.url).ext
        if(ext.split("?")[0] !== ""){ // Check if the file is a file (end with an extension).
            return {file:new MessageAttachment(file.url, file.name)}
        } else { // If the "file" is not a file, it's a link: get the destination of the links as pronote give only a temporarly link.
            try {
                let response = await axios.get(file.url) 
                const destinationLink = response.request.res.responseUrl;
                return {link:`[${file.name}](${destinationLink})`}
            } catch (error) {
                console.error(error)
            }
        }
        
    })
    let parsedFiles = []
    let links = []
    let parsedLinks;

    await Promise.all(promise).then((results) => { // -> Make the program for the axios.get to finish
        results.forEach(result => {

            if(result.hasOwnProperty("link")){
                links.push(result.link)
            }else if(result.hasOwnProperty("file")){
                parsedFiles.push(result.file)
            }

            parsedLinks = links.join("\n ") // Join all the links in one string
        }) 
    })
    return {files: parsedFiles, links: parsedLinks}

    
}

async function getEmbed(homework, dueDate, givenDate) {
    const promise = new Promise(async (resolve, reject) => {
        await parseFiles(homework.files).then((files) => {
            let content = {
                embeds: [{
                    title: "Travail en " + homework.subject + " à rendre pour le " + dueDate.format("DD/MM/YYYY"),
                    description: homework.description ? homework.description : "",
                    color: config.colors[homework.subject] ? config.colors[homework.subjet] : homework.color,
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
            }

            if(files.files.length !== 0)content.files = files.files // add the files attachments to the messages
            if(files.links){ // Add the lins to the embeds if there are.
                content.embeds[0].fields.push({
                    name: "Liens: ",
                    value: files.links
                })
            }
            resolve(content)
        })
    })
    return promise

}