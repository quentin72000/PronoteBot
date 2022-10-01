// const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config();

let pronoteapi = require("pronote-api");


module.exports = { login };



async function login(callback) {
  try {
    const session = await pronoteapi.login(process.env.PRONOTE_URL, process.env.PRONOTE_USERNAME, process.env.PRONOTE_PASSWORD /*, cas*/ );
    // const session = await pronoteapi.login(url, username, password /*, cas*/ );
    if(session.user !== null && session.user != undefined) {
      console.log("Succesfully logged as ",session.user.name)
      callback(session)
    }
    
  } catch (err) {
    if (err.code === pronoteapi.errors.WRONG_CREDENTIALS.code) {
      console.error('Mauvais identifiants');
    } else {
      console.error(err);
    }
  }
  


}