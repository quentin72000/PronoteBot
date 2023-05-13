let client = require("../index.js");
let { db, config } = client;

module.exports = {
    run: async function () {
        let taskName = "updateMoyenne"
        console.log(`Running the ${taskName} task.`)
        let options = config.tasksConfig.find(e => e.name === taskName).options // get the options of the task from the config

        let content = options.pingOnMoyenneUpdate ? `<@${config.notificationUserId}>` : null
        let session = await client.pronote.login()
        await session.marks().then((async(moyennes) => {
            await client.pronote.logout(session, taskName)

            // m = moyenne générale perso, mc = moyenne de la classe
            let m = moyennes.averages.student
            let mc = moyennes.averages.studentClass
    
            await initializeMatiere(moyennes, m, mc)
            let channel = client.channels.cache.get(client.config.channels.moyenne);
            try {
                let result = db.prepare("SELECT * FROM moyenne").all()
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
                                content: content
                            });
                        });
                    }
                    if (global.moyenne > m) {
                        checkMoyenneUpdateForMatters(moyennes, async (changes) => {
                            await channel.send({
                                embeds: [{
                                    title: ":arrow_lower_right: Votre moyenne a baissé !",
                                    description: `\`-${diff(global.moyenne, m)}\` \n\`Avant:\` ${global.moyenne}\n\`Aprés:\` ${m}\n\n\`Moyenne de la classe:\` ${mc} ${changes.length !== 0 ? "\n\nChangements:" + changes.map(x => `\n\`${x.matter}\`: \`${x.old}\` -> \`${x.new}\``).join("") : ""}`,
                                    color: 'RED'

                                }],
                                content: content
                            });
                        });

                    }
                    await db.prepare(`UPDATE moyenne SET  moyenne = ?, moyenne_classe =? WHERE matiere=?`).run(m, mc, 'global')
                }
            } catch (error) {
                throw error;
            }
            
                
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

    try {
        let data = db.prepare(`SELECT * FROM moyenne`).all()
        moyennes.subjects.forEach(async (matterData) => { // loop each mater
            let matter = data.find(x => x.matiere == matterData.name) // find the conresponding row in the table
            if (!matter) { // if not found, create it with current value

                // mm = moyenne matiere, mmc = moyenne matiere de la classe
                let mm = matterData.averages.student
                let mmc = matterData.averages.studentClass;

                console.log(`Inserting ${matterData.name} in the table moyenne.`)
                await db.prepare(`INSERT INTO moyenne (matiere, moyenne, moyenne_classe) VALUES (?, ?, ?)`).run(matterData.name, mm, mmc)
            }
        })
        
        let globalData = await db.prepare("SELECT * FROM moyenne WHERE matiere = ?").run('global') // insert the global moyenne in the table with the actual global moyenne if not exist
        if (!globalData) {
            console.log("Inserting global in the table moyenne.")
            await db.run(`INSERT INTO moyenne (matiere, moyenne, moyenne_classe) VALUES (?, ?, ?)`).run('global', m, mc)
            
        }
        
    } catch (error) {
        throw error;
    }
    

}

async function checkMoyenneUpdateForMatters(moyennes, callback) {
    let changes = []
    moyennes.subjects.forEach(async (matter) => {
        try {
            let data =  db.prpeare(`SELECT * FROM moyenne WHERE matiere = ?`).get(matter.name)
            if (!data) await initializeMatiere()
            else if (data.moyenne != matter.averages.student) {
                if (data.moyenne < matter.averages.student) {
                    changes.push({
                        matter: matter.name,
                        old: data.moyenne,
                        new: matter.averages.student
                    });
                    db.prepare(`UPDATE moyenne SET moyenne = ?, moyenne_classe=? WHERE matiere=?`).run(matter.averages.student, matter.averages.studentClass, matter.name)
                }
            }
        } catch (error) {
            throw error;
        }
        
    })
    callback(changes)
}