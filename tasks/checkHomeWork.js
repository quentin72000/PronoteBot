const fs = require('fs');
const moment = require('moment');

let client = require("../index.js")
let {db,config} = client;

module.exports = {
    run: async function () {

        console.log("Running the checkHomeWork task")
        let session = await client.pronote.login()
        // Reading pronote api output
        session.homeworks(new Date(), parseToDate()).then(async(homeworks) => { // get homeworks for the next 30 days
            session.logout()
            for (let i = 0; i < homeworks.length; i++) {
                const value = homeworks[i];

                // date to timestamp
                var givenDate = moment(value.givenAt);
                var dueDate = moment(value.for);

                let description = value.description.replaceAll('"', '""').replaceAll("'", "''")
                
            await db.get(`SELECT * FROM homework WHERE id="${value.id}"`, async (err, result) => {
                    // console.log(result);
                    if (err) console.error(err)
                    if (!result) { // si le devoir n'est pas dans la db, continuez
                        console.log("Adding a new homework to db...")
                        await client.channels.cache.get(config.channels.homework).send({
                            embeds: [getEmbed(value, dueDate, givenDate)]
                        }).then(async (msg) => {
                            await db.run(`INSERT INTO homework (id, matiere, description, date_rendue, date_donne, fait, message_id) VALUES ('${value.id}', '${value.subject}', '${description}', '${value.for.toISOString()}', '${value.givenAt.toISOString()}', 0, ${msg.id})`, (err) => {
                                if (err) console.error(err)
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
                        await client.channels.cache.get(client.config.channels.homework).send({
                            embeds: [getEmbed(value, dueDate, givenDate)]
                        }).then(async (msg) => {
                            await db.run(`UPDATE homework SET fait=0, message_id=${msg.id} WHERE id='${value.id}'`)
                        })
                    }

                })
            }
        }) 
        
    },
    task: {
        cron: "*/10 * * * *", // https://crontab.guru
        // cron: "* * * * *", // testing purpose
        runOnStartup: true, // if true, the task will be run on startup of the bot
        name: "checkHomeWork"
    }
};

function decode(string) {
    return string.replace(/&#(\d+);/g, function (match, dec) {
        return String.fromCharCode(dec);
    });

}


function parseToDate() { // Get the date to one mounth after now
    let originalDate = new Date();
    return returnDate = new Date(originalDate.getFullYear(), originalDate.getMonth()+1, originalDate.getDate());
}

function parseFiles(files) {
    let filesString = []
    files.forEach(function (file) {
      filesString.push(`[${file.name}](${file.url})`)  
    })
}


function getEmbed(homework, dueDate, givenDate){
    return {
        title: "Travail en " + homework.subject + " à rendre pour le " + dueDate.format("DD/MM/YYYY"),
        description: homework.description,
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
            },
            {
                name: "Fichiers: ",
                value: homework.files.length > 0 ? parseFiles(homework.files).join(", ") : "Aucun fichier"
            }
        ]
    }
}