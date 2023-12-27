// Use this script to clean the DB for a new year.
// Warning: This script will delete all the data from the DB. Please make a backup if you want to be able to restore the data later.


/* eslint-disable n/no-sync */
const sqlite = require("better-sqlite3");
const fs = require("fs");

// Check if db exists
if (!fs.existsSync("data.db")) {
    console.log("DB not found. Aborting...");
    return;
}


// Input the user for a confirmation
const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

console.warn("⚠ This script will delete all the data from the DB (except the config). ⚠"
  + "\nPlease make a backup if you want to be able to restore the data later.");
readline.question("Are you sure you want to delete all the data from the DB? (y/n) ", async(answer) => {
    try {
        if (answer === "y") {
            console.log("Deleting all the data from the DB and recreating...");
            await recreateDB();
        } else {
            console.log("Aborting...");
        }
    } catch (err) {
        console.error(err);
    } finally {
        readline.close();
    }
});


async function recreateDB() {
    const db = new sqlite("./data.db");
    try {
        // Delete all the tables from the DB

        db.prepare("DROP TABLE IF EXISTS changementedt").run();
        db.prepare("DROP TABLE IF EXISTS homework").run();
        db.prepare("DROP TABLE IF EXISTS moyenne").run();
        db.prepare("DROP TABLE IF EXISTS holidays").run();

        // Re-create the tables
        db.exec(`
        CREATE TABLE "changementedt" (
            "id" TEXT NOT NULL,
            "timestamp" INTEGER,
            "prof" TEXT,
            "matiere" TEXT,
            "raison" TEXT
        );
        
        CREATE TABLE "homework" (
            "id" TEXT NOT NULL UNIQUE,
            "matiere" TEXT,
            "description" TEXT,
            "date_rendue" TEXT,
            "date_donne" TEXT,
            "fichiers" TEXT,
            "fait" INTEGER,
            "message_id" TEXT,
            PRIMARY KEY("id")
        );
        
        CREATE TABLE "moyenne" (
            "matiere" TEXT,
            "moyenne" INTEGER,
            "moyenne_classe" INTEGER
        );
        
        CREATE TABLE IF NOT EXISTS "config" (
            "name" TEXT NOT NULL UNIQUE,
            "value" TEXT
        );

        CREATE TABLE "holidays" (
            "name" TEXT,
            "from" INTEGER,
            "to" TEXT,
            "reminder_before_start" INTEGER DEFAULT 0,
            "reminder_start" INTEGER DEFAULT 0,
            "reminder_before_end" INTEGER DEFAULT 0,
            "reminder_end" INTEGER DEFAULT 0
        );`);
        db.prepare("INSERT INTO moyenne (matiere) VALUES (?);").run("global");

    } catch (error) {
        throw new Error("Cannot create DB... Aborting... " + error);
    } finally {
        console.log("DB successfully recreated !");
        db.close();
    }
}


