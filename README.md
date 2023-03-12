<h1 align="center" id="title">PronoteBot</h1>

<p align="center"><img src="https://github.com/quentin72000/PronoteBot/raw/rewrite/assets/logo.png" alt="project-image"></p>

<p id="description" align="center">PronoteBot is a discord bot who inform about certain event of Pronote using the pronote-api by Litarvan</p>

## Project Screenshots:

<div float="left">
    <img src="https://github.com/quentin72000/PronoteBot/raw/rewrite/assets/homeworks.png" alt="Homeworks embed notifcations" width="250">

  <img src="https://github.com/quentin72000/PronoteBot/raw/rewrite/assets/missingTeacher.png" alt="Timetable changes notifications" width="250">

  <img src="https://github.com/quentin72000/PronoteBot/raw/rewrite/assets/averageUpdate.png" alt="Average update notifications" width="200">
</div>

  
  
## 🧐 Features

Here're some of the project's best features:

*   Average update embed
*   Homework embed
*   QCM reminder (SOON)
*   Timetable updated live
*   Timetable update (missings teachers changed room...)

## ❔Requirement:
* Node.js `v16.6.0` or or higher
* NPM
* A Discord Bot Token [(get one here)](https://discord.com/app)
* **Direct** Pronote Passwords or with a CAS

## 🛠️ Installation Steps:</h2>

1. Clone or download the repository
```sh
git clone --single-branch --branch rewrite https://github.com/quentin72000/PronoteBot.git
```

2. Start a comand line or move in the folder of the project.
```sh
cd PronoteBot
```

3. Install NPM dependencies

```sh
npm i
```

4. Rename .env.exemple to .env and change the settings with yours.

```env
# Pronote Login
PRONOTE_URL="YOUR FULL PRONOTE URL (without eleve.html or parent.html)" 
PRONOTE_USERNAME="YOUR ENT USERNAME"
PRONOTE_PASSWORD="YOUR ENT PASSWORD"
CAS="YOUR CAS (see list) or none if you don't use a CAS"

# Discord Token 
BOT_TOKEN=YOUR DISCORD BOT TOKEN
```

5. Rename config.js.exemple to config.js and change the settings with yours.

```js
module.exports = {


    "owner_id": "Bot owner id (unlock eval command)",
    prefix: "Bot prefix for message commands",
    slashCommandGuildId: "slash command guild id",
    channels: {
        homework: "channel id for homework",
        moyenne: "channel id for moyenne",
        suggId: "channel id for suggestion",
        timetableChange: "channel id for timetable change",
        timetable: "channel id for timetable embed channel",
        timetableMsg: "message id of the embed timetable message"
    },
    colors: { // Set colors for each subject in your timetable. The name must be the same as what you see in your timetable to work ! (Will be removed in a next update to use colors that are already defined in Pronote !)   
            "subject name": "#customColor", 
            // "SCIENCES VIE & TERRE": "#38c219", // example
            default: "#000000" // default color must be provided ! He will be used for all non-set subject
    }
}
```

6. Run the program

```sh
node .
```

## How to get the credentials for Pronote if you don't have them
* If you have your email setup in your account (visible in `Mes données` --> `Mon profile`) you can remove`?identifiant=` and what is after of the pronote url and "add `?login=true` at the end.
This way you will have access to the login page. You can now ask for a username and password by clicking on `Récupérer son identifiant et son mot de passe`.

* If your email is not set on your account and you don't have the password, you will need to use a Regional CAS.

> **Note:** If you can connect directly from Pronote, the bot will work with every ENT.
<details>
  <summary>CAS list</summary>
  
    - Académie d'Orleans-Tours (CAS : ac-orleans-tours, URL : "ent.netocentre.fr")
    - Académie de Besançon (CAS : ac-besancon, URL : "cas.eclat-bfc.fr")
    - Académie de Bordeaux (CAS : ac-bordeaux, URL : "mon.lyceeconnecte.fr")
    - Académie de Bordeaux 2 (CAS : ac-bordeaux2, URL : "ent2d.ac-bordeaux.fr")
    - Académie de Caen (CAS : ac-caen, URL : "fip.itslearning.com")
    - Académie de Clermont-Ferrand (CAS : ac-clermont, URL : "cas.ent.auvergnerhonealpes.fr")
    - Académie de Dijon (CAS : ac-dijon, URL : "cas.eclat-bfc.fr")
    - Académie de Grenoble (CAS : ac-grenoble, URL : "cas.ent.auvergnerhonealpes.fr")
    - Académie de la Loire (CAS : cybercolleges42, URL : "cas.cybercolleges42.fr")
    - Académie de Lille (CAS : ac-lille, URL : "cas.savoirsnumeriques62.fr")
    - Académie de Lille (CAS : ac-lille2, URL : "teleservices.ac-lille.fr")
    - Académie de Limoges (CAS : ac-limoges, URL : "mon.lyceeconnecte.fr")
    - Académie de Lyon (CAS : ac-lyon, URL : "cas.ent.auvergnerhonealpes.fr)
    - Académie de Marseille (CAS : atrium-sud, URL : "atrium-sud.fr")
    - Académie de Montpellier (CAS : ac-montpellier, URL : "cas.mon-ent-occitanie.fr")
    - Académie de Nancy-Metz (CAS : ac-nancy-metz, URL : "cas.monbureaunumerique.fr")
    - Académie de Nantes (CAS : ac-nantes, URL : "cas3.e-lyco.fr")
    - Académie de Poitiers (CAS : ac-poitiers, URL : "mon.lyceeconnecte.fr")
    - Académie de Reims (CAS : ac-reims, URL : "cas.monbureaunumerique.fr")
    - Académie de Rouen (Arsene76) (CAS : arsene76, URL : "cas.arsene76.fr")
    - Académie de Rouen (CAS : ac-rouen, URL : "nero.l-educdenormandie.fr")
    - Académie de Strasbourg (CAS : ac-strasbourg, URL : "cas.monbureaunumerique.fr")
    - Académie de Toulouse (CAS : ac-toulouse, URL : "cas.mon-ent-occitanie.fr")
    - Académie du Val-d'Oise (CAS : ac-valdoise, URL : "cas.moncollege.valdoise.fr")
    - ENT "Agora 06" (Nice) (CAS : agora06, URL : "cas.agora06.fr")
    - ENT "Haute-Garonne" (CAS : haute-garonne, URL : "cas.ecollege.haute-garonne.fr")
    - ENT "Hauts-de-France" (CAS : hdf, URL : "enthdf.fr")
    - ENT "La Classe" (Lyon) (CAS : laclasse, URL : "www.laclasse.com")
    - ENT "Lycee Connecte" (Nouvelle-Aquitaine) (CAS : lyceeconnecte, URL : "mon.lyceeconnecte.fr")
    - ENT "Seine-et-Marne" (CAS : seine-et-marne, URL : "ent77.seine-et-marne.fr")
    - ENT "Somme" (CAS : somme, URL : "college.entsomme.fr")
    - ENT "Portail Famille" (Orleans Tours) (CAS : portail-famille, URL : "seshat.ac-orleans-tours.fr:8443")
    - ENT "Toutatice" (Rennes) (CAS : toutatice, URL : "www.toutatice.fr")
    - ENT "Île de France" (CAS : iledefrance, URL : "ent.iledefrance.fr")
    - ENT "Mon collège Essonne" (CAS : moncollege-essonne, URL : "www.moncollege-ent.essonne.fr")
    - ENT "Paris Classe Numerique" (CAS : parisclassenumerique, URL : "ent.parisclassenumerique.fr")
    - ENT "Lycee Jean Renoir Munich" (CAS : ljr-munich, URL : "cas.kosmoseducation.com")
    - ENT "L'Eure en Normandie" (CAS : eure-normandie, URL : "cas.ent27.fr")  
    - ENT "Mon Bureau Numérique" via EduConnect (CAS: monbureaunumerique-educonnect, URL: "cas.monbureaunumerique.fr")
    - ENT "L’Éduc de Normandie" (CAS : educdenormandie, URL : "ent.l-educdenormandie.fr")

</details>
If your CAS or ENT is not on the list, feel free to open an Issue and I will try to help you.
  
  
## 💻 Built with:

Technologies used in the project:

*   Node.JS
*   Litarvan/pronote-api
*   Discord.js V13