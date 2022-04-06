const fs = require('fs');
const config = require('../config.json');
const {
    getAllData
} = require('../pronote.js')

module.exports = {
    run: async function () {
        new Promise(async(resolve, reject) => {
            console.log("Running the updateMoyenne task")
            let {
                db,
                client
            } = require("../index.js")
            await getAllData(function (data) {
                const stringjsondb = fs.readFileSync("./db.json")
                let jsondb = JSON.parse(stringjsondb)
                let m = parseFloat(jsondb.notes.moyGenerale.V.replace(",", "."))
                let mc = parseFloat(jsondb.notes.moyGeneraleClasse.V.replace(",", "."))
                // m = moyenne générale perso, mc = moyenne de la class
                db.get("SELECT * FROM moyenne", (err, data) => {
                    if (err) throw err;
                    if (!data) {
                        db.run(`INSERT INTO moyenne (moyenne, moyenne_classe) VALUES ("${m}", ${mc})`)
                    } else if (data.moyenne != m) {
                        if (data.moyenne < m) {
                            client.channels.cache.get("799769654502490142").send({
                                embeds: [{
                                    title: ":arrow_upper_right: Votre moyenne a augmenté !",
                                    description: `\`+${diff(data.moyenne, m)}\` \n\`Avant:\` ${data.moyenne}\n\`Aprés:\` ${m}\n\n\`Moyenne de la classe:\` ${mc}`
                                }],
                                content: `<@${config.owner_id}>`
                            })
                        }
                        if (data.moyenne > m) {
                            client.channels.cache.get("799769654502490142").send({
                                embeds: [{
                                    title: ":arrow_lower_right: Votre moyenne a baissé !",
                                    description: `\`-${diff(data.moyenne, m)}\` \n\`Avant:\` ${data.moyenne}\n\`Aprés:\` ${m}\n\n\`Moyenne de la classe:\` ${mc}`
                                }],
                                content: `<@${config.owner_id}>`
                            })
                        }

                        // client.channels.cache.get("799769654502490142").send("Ta moyenne est passé de " + data.moyenne + " à " + m + '\nLa moyenne de la classe est de ' + mc)
                        db.run(`UPDATE moyenne SET  moyenne = "${m}", moyenne_classe ="${mc}" WHERE moyenne="${data.moyenne}"`)
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
        runOnStartup: true,
        name: "updateMoyenne"
    }
};

function diff(num1, num2) {
    if (num1 > num2) {
        return num1 - num2
    } else {
        return num2 - num1
    }
}