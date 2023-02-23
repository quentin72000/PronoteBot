<h1 align="center" id="title">PronoteBot</h1>

<p align="center"><img src="https://github.com/quentin72000/PronoteBot/raw/main/assets/logo.png" alt="project-image"></p>

<p id="description" align="center">PronoteBot is a discord bot who inform about certain event of Pronote using the pronote-api by Litarvan</p>

## Project Screenshots:

<div float="left">
    <img src="https://github.com/quentin72000/PronoteBot/raw/main/assets/homeworks.png" alt="Homeworks embed notifcations" width="250">

  <img src="https://github.com/quentin72000/PronoteBot/raw/main/assets/missingTeacher.png" alt="Timetable changes notifications" width="250">

  <img src="https://github.com/quentin72000/PronoteBot/raw/main/assets/averageUpdate.png" alt="Average update notifications" width="200">
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
* **Direct** Pronote Passwords or with a CAS **(CAS comming-soon)**

## 🛠️ Installation Steps:</h2>

1. Clone or download the repository
```sh
git clone https://github.com/quentin72000/PronoteBot.git
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

  
  
## 💻 Built with:

Technologies used in the project:

*   Node.JS
*   Litarvan/pronote-api
*   Discord.js V13