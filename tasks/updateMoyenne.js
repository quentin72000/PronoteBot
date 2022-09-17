const fs = require('fs');
let client = require("../index.js");
let {db,config} = client;
const {
    getAllData
} = require('../pronote.js');

module.exports = {
    run: async function () {

        new Promise(async (resolve, reject) => {
            console.log("Running the updateMoyenne task");
            await initializeMatiere()
            let channel = client.channels.cache.get(client.config.channels.moyenne);
            await getAllData(function (data) {
                const stringjsondb = fs.readFileSync("./db.json");
                let jsondb = JSON.parse(stringjsondb);
                let m = parseFloat(jsondb.notes.moyGenerale.V.replace(",", "."));
                let mc = parseFloat(jsondb.notes.moyGeneraleClasse.V.replace(",", "."));
                // m = moyenne générale perso, mc = moyenne de la class
                db.all("SELECT * FROM moyenne", async (err, all) => {
                    if (err) throw err;
                    if (all.length === 0) {
                        console.log("moyenne table is empty, initializing...");
                        await initializeMatiere();
                    }
                    let global = all.filter(x => x.matiere == "global")
                    if (global.moyenne != m) {
                        if (global.moyenne < m) {
                            checkMoyenneUpdateForMatters(all, async (changes) => {
                                await channel.send({
                                    embeds: [{
                                        title: ":arrow_upper_right: Votre moyenne a augmenté !",
                                        description: `\`+${diff(global.moyenne, m)}\` \n\`Avant:\` ${global.moyenne}\n\`Aprés:\` ${m}\n\n\`Moyenne de la classe:\` ${mc}${changes.length ? "\n\nChangements:" + changes.map(x => `\n\`${x.matter}\`: \`${x.old}\` -> \`${x.new}\``).join("") : ""}`
                                    }],
                                    content: `<@${config.owner_id}>`
                                });
                            });
                        }
                        if (global.moyenne > m) {
                            checkMoyenneUpdateForMatters(all, async (changes) => {
                                await channel.send({
                                    embeds: [{
                                        title: ":arrow_lower_right: Votre moyenne a baissé !",
                                        description: `\`-${diff(global.moyenne, m)}\` \n\`Avant:\` ${global.moyenne}\n\`Aprés:\` ${m}\n\n\`Moyenne de la classe:\` ${mc} ${changes.length ? "\n\nChangements:" + changes.map(x => `\n\`${x.matter}\`: \`${x.old}\` -> \`${x.new}\``).join("") : ""}`
                                    }],
                                    content: `<@${config.owner_id}>`
                                });
                            });

                        }

                        // client.channels.cache.get("799769654502490142").send("Ta moyenne est passé de " + data.moyenne + " à " + m + '\nLa moyenne de la classe est de ' + mc)
                        await db.run(`UPDATE moyenne SET  moyenne = "${m}", moyenne_classe ="${mc}" WHERE matiere="global"`, (err) => {
                            if (err) throw err
                        });
                    }
                })
                resolve()
            })
        }).then(() => {
            require('./checkHomeWork.js').run()
        })


    },
    task: {
        cron: "*/30 * * * *",
        // cron: "* * * * *", // testing purposes
        runOnStartup: false,
        name: "updateMoyenne"
    }
};

function diff(num1, num2) {
    if (num1 > num2) {
        let result = num1 - num2
        return result.toPrecision(2)
    } else {
        let result = num2 - num1

        return result.toPrecision(2)
    }
}

// inset in the table moyenne for each matter and set it to the actual value if it doesn't exist
async function initializeMatiere() {
    const stringjsondb = fs.readFileSync("./db.json")
    let jsondb = JSON.parse(stringjsondb)
    console.log("Initializing the moyenne table...")

    // m = moyenne générale perso, mc = moyenne de la classe
    let m = parseFloat(jsondb.notes.moyGenerale.V.replace(",", "."))
    let mc = parseFloat(jsondb.notes.moyGeneraleClasse.V.replace(",", "."))

    await db.all(`SELECT * FROM moyenne`, async (err, data) => { // select all the rows in the table
        if (err) throw err;
        jsondb.notes.listeServices.V.forEach(async (matterData) => { // loop each mater in the json db
            let matter = data.find(x => x.matiere == matterData.L) // find the conresponding row in the table
            if (!matter) { // if not found, create it with current value

                // mm = moyenne matiere, mmc = moyenne matiere de la classe
                let mm = parseFloat(matterData.moyEleve.V.replace(",", "."))
                let mmc = parseFloat(matterData.moyClasse.V.replace(",", "."))

                console.log(`Inserting ${matterData.L} in the table moyenne.`)
                await db.run(`INSERT INTO moyenne (matiere, moyenne, moyenne_classe) VALUES ('${matterData.L}', ${mm}, ${mmc})`, (err) => {
                    if (err) throw err;
                })
            }
        })
    })
    await db.get("SELECT * FROM moyenne WHERE matiere = 'global'", async (err, data) => { // insert the global moyenne in the table with the actual global moyenne if not exist
        if (err) throw err;
        if (!data) {
            console.log("Inserting global in the table moyenne.")
            await db.run(`INSERT INTO moyenne (matiere, moyenne, moyenne_classe) VALUES ('global', ${m}, ${mc})`, (err) => {
                if (err) throw err
            })
        }
    })

}   

async function checkMoyenneUpdateForMatters(jsondb, callback) {
    let changes = []
    jsondb.notes.listeServices.V.forEach(async (matter) => {
        await db.get(`SELECT * FROM moyenne WHERE matiere = '${matter.L}'`, async (err, data) => {
            if (err) throw err;
            if (!data) await initializeMatiere()
            else if (data.moyenne != matter.moyEleve) {
                if (data.moyenne < matter.moyEleve) {
                    changes.push({
                        matter: matter.L,
                        old: data.moyenne,
                        new: matter.moyEleve
                    });
                    db.run(`UPDATE moyenne SET moyenne = "${matter.moyEleve}", moyenne_classe="${matter.moyClasse}" WHERE matiere="${matter.L}"`, (err) => {
                        if (err) throw err
                    })
                }
            }
        })
    })
    callback(changes)
}