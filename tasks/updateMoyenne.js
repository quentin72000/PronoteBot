const client = require("../index.js");
const { db, config } = client;

module.exports = {
    run: async function() {
        const taskName = "updateMoyenne";
        console.log(`Running the ${taskName} task.`);
        const options = config.tasksConfig.find(e => e.name === taskName).options; // get the options of the task from the config

        const content = options.pingOnMoyenneUpdate ? `<@${config.notificationUserId}>` : null;
        const session = await client.pronote.login();
        await session.marks().then((async(moyennes) => {
            await client.pronote.logout(session, taskName);

            // m = moyenne générale perso, mc = moyenne de la classe
            const m = moyennes.averages.student;
            const mc = moyennes.averages.studentClass;

            await initializeMatieres(moyennes, m, mc);
            const channel = client.channels.cache.get(client.config.channels.moyenne);

            const result = db.prepare("SELECT * FROM moyenne").all();
            const global = result.filter(x => x.matiere === "global")[0];
            if (global.moyenne !== m) {
                if (global.moyenne < m) {
                    checkMoyenneUpdateForMatters(moyennes, async(changes) => {
                        await channel.send({
                            embeds: [{
                                title: ":arrow_upper_right: Votre moyenne a augmenté !",
                                description: `\`+${diff(global.moyenne, m)}\` \n`
                                    + `\`Avant:\` ${global.moyenne}\n`
                                    + `\`Aprés:\` ${m}\n\n`
                                    + `\`Moyenne de la classe:\` ${mc}`
                                    + (changes.length > 0 ?
                                        changes.map(x => `\n\nChangements:\n\`${x.matter}\`: `
                                           + `\`${x.old}\` -> \`${x.new}\``)
                                            .join("")
                                        : ""),
                                color: "GREEN"
                            }],
                            content: content
                        });
                    });
                }
                if (global.moyenne > m) {
                    checkMoyenneUpdateForMatters(moyennes, async(changes) => {
                        await channel.send({
                            embeds: [{
                                title: ":arrow_lower_right: Votre moyenne a baissé !",
                                description: `\`-${diff(global.moyenne, m)}\` \n`
                                    + `\`Avant:\` ${global.moyenne}\n`
                                    + `\`Aprés:\` ${m}\n\n`
                                    + `\`Moyenne de la classe:\` ${mc}`
                                    + (changes.length > 0 ?
                                        changes.map(x => `\n\nChangements:\n\`${x.matter}\`: `
                                          + `\`${x.old}\` -> \`${x.new}\``)
                                            .join("")
                                        : ""),
                                color: "RED"
                            }],
                            content: content
                        });
                    });
                }

                await db.prepare(`
                    UPDATE moyenne 
                    SET moyenne = ?, moyenne_classe = ? 
                    WHERE matiere = ?
                `).run(m, mc, "global");
            }

        }));

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
        const result = num1 - num2;
        return result.toPrecision(2);
    }
    const result = num2 - num1;

    return result.toPrecision(2);

}

// inset in the table moyenne for each matter and set it to the actual value if it doesn't exist
async function initializeMatieres(moyennes, m, mc) {

    console.log("Initializing the moyenne table...");


    const data = db.prepare("SELECT * FROM moyenne").all();
    moyennes.subjects.forEach(async(matterData) => {
        const matter = data.find(x => x.matiere === matterData.name);
        if (!matter) {
            // mm = moyenne matiere, mmc = moyenne matiere de la classe
            const mm = matterData.averages.student;
            const mmc = matterData.averages.studentClass;

            console.log(`Inserting ${matterData.name} in the table moyenne.`);
            await db.prepare(`
                INSERT INTO moyenne (matiere, moyenne, moyenne_classe)
                VALUES (?, ?, ?)
            `).run(matterData.name, mm, mmc);
        }
    });

    const globalData = await db.prepare("SELECT * FROM moyenne WHERE matiere = ?").run("global");
    if (!globalData) {
        console.log("Inserting global in the table moyenne.");
        await db.prepare(`
            INSERT INTO moyenne (matiere, moyenne, moyenne_classe)
            VALUES (?, ?, ?)
        `).run("global", m, mc);
    }
}

async function checkMoyenneUpdateForMatters(moyennes, callback) {
    const changes = [];
    moyennes.subjects.forEach(async(matter) => {
        const data = db.prepare("SELECT * FROM moyenne WHERE matiere = ?").get(matter.name);
        // if (!data) await initializeMatieres();
        if (data.moyenne !== matter.averages.student) {
            changes.push({
                matter: matter.name,
                old: data.moyenne,
                new: matter.averages.student
            });
            db.prepare("UPDATE moyenne SET moyenne = ?, moyenne_classe=? WHERE matiere=?")
                .run(matter.averages.student, matter.averages.studentClass, matter.name);
        }

    });
    callback(changes);
}