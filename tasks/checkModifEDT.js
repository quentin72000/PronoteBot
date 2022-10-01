const fs = require('fs');
const {getAllData} = require('../pronote.js')

let client = require("../index.js");
const { log } = require('console');
let {config, db} = client;
module.exports = {
    run: async function () {
        
        console.log("Running the checkModifEDT task")
        const stringjsondb = fs.readFileSync("./db.json")
        let jsondb = JSON.parse(stringjsondb)
            let modifEDT = []

            modifEDT.push({
                prof: "jjds",
                matiere: "dksdk",
                date: "jfdjfd"
            })

            jsondb.accueil.ListeCours.forEach((value) => {
                if (value.Statut) {
                    switch (value.Statut) {
                        case "Prof. absent":
                            if (value.estAnnule === true) {
                                modifEDT.push({
                                    prof: value.ListeContenus.V[1].L,
                                    matiere: value.ListeContenus.V[0].L,
                                    salle: value.ListeContenus[2].L,
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
                                    salle: value.ListeContenus[2].L,
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
                                    salle: value.ListeContenus.V[2].L,
                                    raison: "annule"
                                })
                            }
                            break;
                        case "Cours déplacé":
                            modifEDT.push({
                                prof: value.ListeContenus.V[1].L,
                                matiere: value.ListeContenus.V[0].L,
                                date: value.DateDuCours.V,
                                salle: value.ListeContenus.V[2].L,
                                raison: "deplace"
                            })
                            break;
                        
                        case "Changement de salle":
                            modifEDT.push({
                                prof: value.ListeContenus.V[1].L,
                                matiere: value.ListeContenus.V[0].L,
                                date: value.DateDuCours.V,
                                old_salle: value.ListeContenus.V[2].L,
                                new_salle: value.ListeContenus.V[3].L,
                                raison: "changement_salle"
                            })
                            break;

                        case "Exceptionnel":
                            modifEDT.push({
                                prof: value.ListeContenus.V[1].L,
                                matiere: value.ListeContenus.V[0].L,
                                date: value.DateDuCours.V,
                                salle: value.ListeContenus.V[2].L,
                                raison: "exceptionnel"
                            })
                    }
                }
            })
            console.log(modifEDT)
            if(modifEDT.length > 0){
                let date = new Date()
                let strings = {
                    absent: [],
                    annule: [],
                    deplace: [],
                    changementSalle: []
                };

                db.all("SELECT * FROM changementedt ORDER BY date", (err,result) => {
                    if(err) throw err;
                    console.table(result)
                    console.table(modifEDT)
                    for(const value of modifEDT){
                        let alreadyExists = result.some(element => {if(element.date === value.date && element.matiere === value.matiere)return true;
                            console.log(value.date, element.date)
                            console.log(value.matiere, element.matiere);
                            })
                            console.log("Already existe ? :", alreadyExists)
    
                            if(value.raison == "absent"){
                                strings.absent.push(`**${value.prof}** (${value.matiere})`)
                            }
                            if(value.raison == "annule"){
                                strings.annule.push(`__${value.matiere}__ à ${value.date.split(" ")[1]}`)
                            }
                            if(value.raison == "deplace"){
                                strings.deplace.push(`__${value.matiere}__ à ${value.date.split(" ")[1]}`)
                            }
                            if(value.raison == "changement_salle"){
                                strings.changementSalle.push(`__${value.matiere}__ à ${value.date.split(" ")[1]} est maintenant prévu en salle **${value.new_salle}**`)
                            }
                            if(value.raison == "exceptionnel"){
                                strings.changementSalle.push(`__${value.matiere}__ à ${value.date.split(" ")[1]} en salle **${value.salle}**`)
                            }
                        };
                    })
                
              /*  client.channels.cache.get(config.channels.timetableChange).send({content: `<@${config.owner_id}>`, embeds: [{
                    title: `Il y a des changements dans votre EDT du ${date.getDate() + "/" + date.getMonth()}.`,
                    description: `${strings.absent ? "Les profs çi-dessous sont absent : \n" + strings.absent.join(",\n") + "\n\n" : ""}${strings.annule ? "Les cours çi-dessous sont annulé: \n" + strings.annule.join(",\n") + "\n\n" : ""}${strings.deplace ? "Les cours çi-dessous on été deplace et mis aux horaires suivant:\n" + strings.deplace.join(",\n") + "\n\n" : ""}${strings.changementSalle ? "Les cours çi-dessous on changé de salle:\n" + strings.changementSalle.join(",\n") + "\n\n" : "" }`
                }]})*/
            } else console.log("No modifEDT")
        
            
        
    },
    task: {
        // cron: "40 7 * * 1-5",
        cron: "",
        // cron: "* * * * *", // testing purpose
        runOnStartup: false,
        name: "checkModifEDT"
    }
};