const moment = require("moment");

const client = require("../index.js");
const { db,config } = client;


const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");


module.exports = {
    name: "checkHomeWork",
    run: async function(session) {
        const taskName = "checkHomeWork";

        console.log(`Running the ${taskName} task.`);

        const from = new Date();
        from.setDate(from.getDate() - 1);
        const to = new Date(from.getFullYear(), from.getMonth() + 1, from.getDate());

        await session.homeworks(from, to).then(async(homeworks) => { // get homeworks for the next 30 days
            for (let i = 0; i < homeworks.length; i++) {
                const value = homeworks[i];

                // eslint-disable-next-line @stylistic/quotes
                const description = value.description.replaceAll('"', '""').replaceAll("'", "''"); // Prevent non escaped character error.

                const result = await db.prepare("SELECT * FROM homework WHERE id=?").get(value.id);
                if (!result) {
                    if (!value.done) {
                        console.log("Adding a new homework to db...");
                        const embed = await getEmbed(value);
                        await client.channels.cache.get(config.channels.homework).send(embed).then(async(msg) => {
                            await db.prepare(`INSERT INTO homework (id, matiere, description, 
                                    date_rendue, date_donne, fait, message_id) VALUES (?, ?, ?, ?, ?, 0, ?)`)
                                .run(value.id, value.subject, description,
                                    value.for.toISOString(), value.givenAt.toISOString(), msg.id);
                        });

                    }
                } else if ((value.done === true && result.fait === 0) || moment(value.for).isBefore()) { // si de devoir existe et que le devoir est fait mais n'est pas marqué comme fait dans la db OU que la date pour rendre le devoir est dépassé, update la valeur "fait" à 1 (true) et SUPPRIME le message du channel homework
                    await client.channels.cache.get(config.channels.homework)
                        .messages.fetch({ message: result.message_id, cache: false, force: true })
                        .then(async(msg) => {
                            msg.delete().then(async() => {
                                await db.prepare("UPDATE homework SET fait=1 WHERE id=?").run(result.id);
                            });
                        }).catch(async(err) => {
                            if (err.code === 10008) { // if the message is not found, update the value "fait" to 1 (true)
                                await db.prepare("UPDATE homework SET fait=1 WHERE id=?").run(result.id);
                            } else {
                                throw err;
                            }
                        });

                } else if (value.done === false && result.fait === 1) { // si le devoir est marqué dans la DB comme fait alors qu'il ne l'est pas sur pronote, repostez le message et remetre la valeur fait à 0 (false) dans la DB.
                    const embed = await getEmbed(value);
                    await client.channels.cache.get(client.config.channels.homework).send(embed)
                        .then(async(msg) => {
                            await db.prepare("UPDATE homework SET fait=0, message_id=? WHERE id=?")
                                .run(msg.id, value.id);
                        });
                }
            }
        });
    }
};


async function parseFiles(files) {
    const result = {
        files: [],
        parsedLinks: ""
    };
    const links = [];

    files.forEach(async(file) => {
        if (file.type === 1) { // File
            result.files.push(new AttachmentBuilder(file.url, { name: file.name }));
        } else if (file.type === 0) { // Link, parse it to discord
            links.push(`[${file.name ? file.name : file.url}](${file.url})`);
        }
    });
    result.parsedLinks = links.join("\n");

    return result;
}


async function getEmbed(homework) {

    const options = config.tasksConfig.find(e => e.name === "checkHomeWork").options;

    const givenDate = moment(homework.givenAt);
    const dueDate = moment(homework.for);

    const files = await parseFiles(homework.files);

    const content = {
        embeds: [new EmbedBuilder()
            .setTitle(`Travail en ${homework.subject} pour le <t:${dueDate.unix()}:d>`)
            .setDescription(homework.description ? homework.description : "")
            .setColor(config.colors[homework.subject] ? config.colors[homework.subject] : homework.color)
            .addFields({ name: "Donné le ", value: `<t:${givenDate.unix()}:D>(<t:${givenDate.unix()}:R>)` })
            .addFields({ name: "Pour le", value: `<t:${dueDate.unix()}:D>(<t:${dueDate.unix()}:R>)` })
        ],
        components: [new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId("homework_done")
            .setLabel("Fait")
            .setStyle(ButtonStyle.Success)
            .setEmoji("✅"))
        ],
        content: options.pingOnNewHomeWork ? `<@${config.notificationUserId}>` : null
    };

    if (files.files.length !== 0) content.files = files.files;
    if (files.parsedLinks) {
        content.embeds[0].setFooter({
            text: "\n\n ⚠️ Certains liens ne marcheront peut-être pas "
          + "si vous n'êtes pas connecter. Veuillez vous connecter à Pronote directement pour y accéder."
        });
        content.embeds[0].addFields({ name: "Liens: ", value: files.parsedLinks });
    }

    return content;
}