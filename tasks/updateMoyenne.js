let client = require("../index.js");
let { db, config } = client;

module.exports = {
    run: async function () {
        let taskName = "updateMoyenne"

        console.log(`Running the ${taskName} task.`)

        let session = await client.pronote.login()
        await session.marks().then((async(moyennes) => {
            await client.pronote.logout(session, taskName)

            // m = moyenne générale perso, mc = moyenne de la classe
            let m = moyennes.averages.student
            let mc = moyennes.averages.studentClass
    
            await initializeMatiere(moyennes, m, mc)
            let channel = client.channels.cache.get(client.config.channels.moyenne);
    
                db.all("SELECT * FROM moyenne", async (err, result) => {
                    let global = result.filter(x => x.matiere == "global")[0]
                    if (global.moyenne !== m) {
                        if (global.moyenne < m) {
                            checkMoyenneUpdateForMatters(moyennes, async (changes) => {
                                await channel.send({
                                    embeds: [{
                                        title: ":arrow_upper_right: Votre moyenne a augmenté !",
                                        description: `\`+${diff(global.moyenne, m)}\` \n\`Avant:\` ${global.moyenne}\n\`Aprés:\` ${m}\n\n\`Moyenne de la classe:\` ${mc}${changes.length ? "\n\nChangements:" + changes.map(x => `\n\`${x.matter}\`: \`${x.old}\` -> \`${x.new}\``).join("") : ""}`,
                                        color: 'GREEN'
                                    }],
                                    content: `<@${config.owner_id}>`
                                });
                            });
                        }
                        if (global.moyenne > m) {
                            checkMoyenneUpdateForMatters(moyennes, async (changes) => {
                                await channel.send({
                                    embeds: [{
                                        title: ":arrow_lower_right: Votre moyenne a baissé !",
                                        description: `\`-${diff(global.moyenne, m)}\` \n\`Avant:\` ${global.moyenne}\n\`Aprés:\` ${m}\n\n\`Moyenne de la classe:\` ${mc} ${changes.length ? "\n\nChangements:" + changes.map(x => `\n\`${x.matter}\`: \`${x.old}\` -> \`${x.new}\``).join("") : ""}`,
                                        color: 'RED'
    
                                    }],
                                    content: `<@${config.owner_id}>`
                                });
                            });
    
                        }
    
                        await db.run(`UPDATE moyenne SET  moyenne = "${m}", moyenne_classe ="${mc}" WHERE matiere="global"`, (err) => {
                            if (err) throw err
                        });
                    }
                })
        }))

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
async function initializeMatiere(moyennes, m, mc) {

    console.log("Initializing the moyenne table...")


    await db.all(`SELECT * FROM moyenne`, async (err, data) => { // select all the rows in the table
        if (err) throw err;
        moyennes.subjects.forEach(async (matterData) => { // loop each mater in the json db
            let matter = data.find(x => x.matiere == matterData.name) // find the conresponding row in the table
            if (!matter) { // if not found, create it with current value

                // mm = moyenne matiere, mmc = moyenne matiere de la classe
                let mm = matterData.averages.student
                let mmc = matterData.averages.studentClass;

                console.log(`Inserting ${matterData.name} in the table moyenne.`)
                await db.run(`INSERT INTO moyenne (matiere, moyenne, moyenne_classe) VALUES ('${matterData.name}', ${mm}, ${mmc})`, (err) => {
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

async function checkMoyenneUpdateForMatters(moyennes, callback) {
    let changes = []
    moyennes.subjects.forEach(async (matter) => {
        await db.get(`SELECT * FROM moyenne WHERE matiere = '${matter.name}'`, async (err, data) => {
            // console.table(data)
            console.table(matter)
            if (err) throw err;
            if (!data) await initializeMatiere()
            else if (data.moyenne != matter.averages.student) {
                if (data.moyenne < matter.averages.student) {
                    changes.push({
                        matter: matter.name,
                        old: data.moyenne,
                        new: matter.averages.student
                    });
                    db.run(`UPDATE moyenne SET moyenne = "${matter.averages.student}", moyenne_classe="${matter.averages.studentClass}" WHERE matiere="${matter.name}"`, (err) => {
                        if (err) throw err
                    })
                }
            }
        })
    })
    callback(changes)
}