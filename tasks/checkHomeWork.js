const fs = require('fs');
const moment = require('moment');

let client = require("../index.js")
let {db,config} = client;

module.exports = {
    run: function () {

        console.log("Running the checkHomeWork task")

        // Reading pronote api output
        const stringjsondb = fs.readFileSync("./db.json")
        let jsondb = JSON.parse(stringjsondb)
        let jsonhomeWorks = jsondb.accueil.travailAFaire.listeTAF.V;


        for (let i = 0; i < jsonhomeWorks.length; i++) {
            const value = jsonhomeWorks[i];


            // date to timestamp
            var dateD = moment(value.donneLe.V, "DD/MM/YYYY");
            console.log("D", dateD.format("DD/MM/YYYY"), value.donneLe.V)

            var dateP = moment(value.pourLe.V, "DD/MM/YYYY");
            console.log("P", dateP.format("DD/MM/YYYY"), value.pourLe.V)


            let description = value.descriptif.V.replaceAll('<div>', '').replaceAll('</div>', '').replaceAll("'", "[q]");
            let fichiers = [];
            if (value.listeDocumentJoint.V.length > 0) {
                value.listeDocumentJoint.V.forEach((value) => fichiers.push(value.L))
            }
            db.get(`SELECT * FROM homework WHERE description='${description}'`, async (err, result) => {
                if (err) console.error(err)
                if (!result) { // si le devoir n'est pas dans la db, continuez
                    console.log("Adding a new homework to db...")
                    await client.channels.cache.get(config.channels.homework).send({
                        embeds: [{
                            title: "Travail en " + value.matiere.V.L + " à rendre pour le " + value.pourLe.V,
                            description: decode(description.replaceAll('[q]', "'")),
                            color: config.colors[value.matiere.V.L] ? config.colors[value.matiere.V.L] : config.colors["default"],
                            fields: [{
                                    name: "Donné le ",
                                    value: `<t:${dateD.unix()}:D>(<t:${dateD.unix()}:R>)`,
                                    // inline: true
                                },
                                {
                                    name: "Pour le",
                                    value: `<t:${dateP.unix()}:D>(<t:${dateP.unix()}:R>)`,
                                    // inline: true
                                },
                                {
                                    name: "Fichiers: ",
                                    value: fichiers.length > 0 ? fichiers.join(", ") : "Aucun fichier"
                                }
                            ]
                        }]
                    }).then(async (msg) => {
                        await db.run(`INSERT INTO homework (matiere, description, date_rendue, date_donne, fichiers, fait, message_id) VALUES ('${value.matiere.V.L}', '${description}', '${value.pourLe.V}', '${value.donneLe.V}', '${fichiers.join(",")}', 0, ${msg.id})`, (err) => {
                            if (err) console.error(err)
                        })
                    })

                } else if ((value.TAFFait === true && result.fait === 0) || dateP.isBefore()) { // si de devoir existe et que le devoir est fait mais n'est pas marqué comme fait dans la db OU que la date pour rendre le devoir est dépassé, update la valeur "fait" à 1 (true) et SUPPRIME le message du channel homework
                    await client.channels.cache.get(config.channels.homework).messages.fetch(result.message_id).then(async (msg) => {
                        msg.delete().then(async () => {
                            await db.run(`UPDATE homework SET fait=1 WHERE id=${result.id}`, (err) => {
                                if (err) console.error(err)
                            })
                        })
                    })

                } else if (value.TAFFait === false && result.fait === 1) { // si le devoir est marqué dans la DB comme fait alors qu'il ne l'est pas sur pronote, repostez le message et remetre la valeur fait à 0 (false) dans la DB.
                    await client.channels.cache.get(client.config.channels.homework).send({
                        embeds: [{
                            title: "Travail en " + value.matiere.V.L + " à rendre pour le " + value.pourLe.V,
                            description: decode(description.replaceAll("[q]", "'")),
                            color: config.colors[value.matiere.V.L] ? config.colors[value.matiere.V.L] : config.colors["default"],
                            fields: [{
                                    name: "Donné le ",
                                    value: `<t:${dateD.unix()}:D>(<t:${dateD.unix()}:R>)`,
                                    inline: true
                                },
                                {
                                    name: "Pour le",
                                    value: `<t:${dateP.unix()}:D>(<t:${dateP.unix()}:R>)`,
                                    inline: true
                                },
                                {
                                    name: "Fichiers: ",
                                    value: fichiers.length > 0 ? fichiers.join(", ") : "Aucun fichier"
                                }
                            ]
                        }]
                    }).then(async (msg) => {
                        await db.run(`UPDATE homework SET fait=0, message_id=${msg.id} WHERE description='${description}'`)
                    })
                }

            })
        }
    },
    task: {
        cron: "30 17 * * *", // https://crontab.guru
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

