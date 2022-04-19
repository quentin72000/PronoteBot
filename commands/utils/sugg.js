module.exports = {
    name: 'sugg',
    aliases: ['suggest', 'sug', 'suggestion', 'suggestion'],
    description: "Envoie une suggestion dans le channel suggestion",
    run: async (client, message, args) => {
        errors = client.errors
        if (!args.length) return errors.otherError(message, 'Vous devez fournir une suggestion après la commande !')
        try {
            var suggC = message.client.channels.cache.get(config.luti.channels.sugg);
            suggC.send({
                embed: {
                    author: {
                        name: "Suggestion de " + message.author.tag,
                        icon_url: message.author.displayAvatarURL({
                            dynamic: true
                        })
                    },
                    title: `Une nouvelle suggestion a été posté !`,
                    description: "**Contenu**: " + args.join(' '),
                    color: "#6D41FF"
                }
            }).then(sugget => {
                sugget.react('✅')
                sugget.react('❌')
            })
            message.delete()
            message.channel.send({
                embed: {

                    title: '✅ Succès !',
                    description: 'La suggestion a bien été envoyé !',
                    color: "#00EA11",

                }
            })
        } catch (err) {
            errors.otherError(message, "Une erreur inconue est survenue, veuillez réessayer ou contactez le dévlopeur")

        }
    }

};