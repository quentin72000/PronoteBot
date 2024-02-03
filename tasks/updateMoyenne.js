const { EmbedBuilder, Colors } = require("discord.js");
const client = require("../index.js");
const { getCurrentTrimester } = require("../utils/pronoteUtils.js");
const { db, config } = client;

module.exports = {
    name: "updateMoyenne",
    run: async function(session) {
        const taskName = "updateMoyenne";
        console.log(`Running the ${taskName} task.`);
        const options = config.tasksConfig.find(e => e.name === taskName).options; // get the options of the task from the config

        const content = options.pingOnMoyenneUpdate ? `<@${config.notificationUserId}>` : null;
        await session.marks().then((async(moyennes) => {

            // m = moyenne générale perso, mc = moyenne de la classe
            const m = moyennes.averages.student;
            const mc = moyennes.averages.studentClass;
            const currentTrimester = getCurrentTrimester(session);
            await initializeMatieres(moyennes, m, mc);
            const channel = client.channels.cache.get(client.config.channels.moyenne);

            const result = db.prepare("SELECT * FROM moyenne").all();
            const global = result.filter(x => x.matiere === "global")[0];
            if (global.moyenne !== m) {
                if (global.moyenne < m) {
                    checkMoyenneUpdateForMatters(moyennes, async(changes) => {
                        const embed = new EmbedBuilder()
                            .setTitle(":arrow_upper_right: Votre moyenne a augmenté !")
                            .setDescription(`\`+${diff(global.moyenne, m)}\` \n`
                                + `\`Avant:\` ${global.moyenne}\n`
                                + `\`Après:\` ${m}\n\n`
                                + `\`Moyenne de la classe:\` ${mc}`
                                + getChangesString(changes))
                            .setFooter({ text: "Période: " + currentTrimester.name })
                            .setColor(Colors.Green);

                        await channel.send({ embeds: [embed], content: content
                        });
                    });
                }
                if (global.moyenne > m) {
                    checkMoyenneUpdateForMatters(moyennes, async(changes) => {
                        const embed = new EmbedBuilder()
                            .setTitle(":arrow_lower_right: Votre moyenne a baissé !")
                            .setDescription(`\`-${diff(global.moyenne, m)}\` \n`
                                + `\`Avant:\` ${global.moyenne}\n`
                                + `\`Après:\` ${m}\n\n`
                                + `\`Moyenne de la classe:\` ${mc}`
                                + getChangesString(changes))
                            .setColor(Colors.Red);

                        await channel.send({ embeds: [embed], content: content });
                    });
                }

                await db.prepare(`
                    UPDATE moyenne 
                    SET moyenne = ?, moyenne_classe = ? 
                    WHERE matiere = ?
                `).run(m, mc, "global");
            }

        }));

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

function getChangesString(changes) {
    if (!changes || changes.length === 0) return "";
    return "\n\nChangements:" + changes.map(x => `\n\`${x.matter}\`: \`${x.old}\` -> \`${x.new}\``).join("\n");
}