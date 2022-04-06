const fs = require('fs');
module.exports = {
    run: function () {
        let {db, client} = require("../index.js")
        console.log("Running the checkHomeWork task")
        const stringjsondb = fs.readFileSync("./db.json")
        let jsondb = JSON.parse(stringjsondb)
        let homeWorks = [];
        jsondb.accueil.travailAFaire.listeTAF.V.forEach(function (value){
            if(value.matiere.V.L === "PHYSIQUE-CHIMIE")console.log(value.descriptif.V.replaceAll("'", "[q]"))
            db.get(`SELECT * FROM homework WHERE description='${value.descriptif.V.replaceAll('<div>', '').replaceAll('</div>', '').replaceAll("'", "[q]")}'`, (err, result) => {
                if(err)console.error(err)
                if(!result){
                    console.log("not found")
                    let fichiers = [];
                    if(value.listeDocumentJoint.V.length > 0){
                        value.listeDocumentJoint.V.forEach((value) => fichiers.push(value.L))
                    }
                    db.run(`INSERT INTO homework (matiere, description, date_rendue, date_donne, fichiers, fait) VALUES ('${value.matiere.V.L}', '${value.descriptif.V.replaceAll('<div>', '').replaceAll('</div>', '').replaceAll("'", "[q]")}', '${value.pourLe.V}', '${value.donneLe.V}', '${fichiers.join(",")}', 0)`, (err) => {if(err)console.error(err)})

                }
                
            })
        })
      },
    task: {
        cron: "30 17 * * *", // https://crontab.guru
        // cron: "* * * * *", // testing purpose
        runOnStartup: true, // if true, the task will be run on startup of the bot
        name: "checkHomeWork"
    }
};