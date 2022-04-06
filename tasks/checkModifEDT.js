const fs = require('fs');
const config = require('../config.json')
const {getAllData} = require('../pronote.js')
module.exports = {
    run: async function () {
        let {db,client} = require("../index.js")
        console.log("Running the checkModifEDT task")
        const stringjsondb = fs.readFileSync("./db.json")
        let jsondb = JSON.parse(stringjsondb)
        await getAllData(function(data){
            let modifEDT = []
            jsondb.accueil.ListeCours.forEach((value) => {
                if (value.Statut) {
                    switch (value.Statut) {
                        case "Prof. absent":
                            if (value.estAnnule === true) {
                                // db.get("SELECT * FROM chan")
                                modifEDT.push({
                                    prof: value.ListeContenus.V[1].L,
                                    matiere: value.ListeContenus.V[0].L,
                                    date: value.DateDuCours.V,
                                    raison: "absent"
                                })
                            }
                            break;
                        case "Prof.\/pers. absent":
                        case "Prof./pers. absent":
                            if (value.estAnnule === true) {
                                modifEDT.push({
                                    prof: value.ListeContenus.V[1].L,
                                    matiere: value.ListeContenus.V[0].L,
                                    date: value.DateDuCours.V,
                                    raison: "absent"
                                })
                            }
                            break;
                        case "Cours annulé":
                        case "Cours annul\u00E9":
                            if(value.estAnnule === true) {
                                modifEDT.push({
                                    prof: value.ListeContenus.V[1].L,
                                    matiere: value.ListeContenus.V[0].L,
                                    date: value.DateDuCours.V,
                                    raison: "annule"
                                })
                            }
                            break;
                    }
                }
            })
            if(modifEDT.length > 0){
                let date = new Date()
                let strings = {
                    absent: "",
                    annule: ""
                };
                modifEDT.forEach(function(value){
                    if(value.raison == "absent")strings.absent += `${value.prof} (${value.matiere}),\n `
                    if(value.raison == "annule")strings.annule += `${value.prof} (${value.matiere}), \n`
                })
                // client.channels.cache.get("799769654502490142").send((strings.absent ? "Les prof suivant: " + strings.absent + " sont absent. " : "") + (strings.annule ? "Les cours suivants: " + strings.annule + " sont annulé." : ""))
                client.channels.cache.get("799769654502490142").send({content: `<@${config.owner_id}>`, embeds: [{
                    title: `Il y a des changements dans votre EDT du ${date.getDate() + "/" + date.getMonth()}.`,
                    description: `${strings.absent ? "Les profs çi-dessous sont absent : \n" + strings.absent + "\n\n" : ""}${strings.annule ? "Les cours çi-dessous sont annulé: \n" + strings.annule + "\n\n" : ""}`
                }]})
            }
            // console.log(modifEDT)
        })
            
        
    },
    task: {
        cron: "40 7 * * 1-5",
        // cron: "* * * * *", // testing purpose
        runOnStartup: false,
        name: "checkModifEDT"
    }
};