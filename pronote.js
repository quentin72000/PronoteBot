// const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config();
let pronoteapi = require("pronote-api");


module.exports = { login };



/**
    * Login in a PronoteApi session
     * @param {Bolean} keepAlive Set if the session should last more than 10 minutes or not. (Dont forgot to `session.setKeepAlive(false)` before login out.)
     * 
     * @returns {pronoteapi.PronoteSession} Return a logged in PronoteAPI session. 
     */

async function login(keepAlive) {
  try {
    const session = await pronoteapi.login(process.env.PRONOTE_URL, process.env.PRONOTE_USERNAME, process.env.PRONOTE_PASSWORD /*, cas*/ );
    // const session = await pronoteapi.login(url, username, password /*, cas*/ );
    session.setKeepAlive(keepAlive, error => {
      console.log(error);
    });
    if(session.user !== null && session.user != undefined) {
      console.log("Succesfully logged as " + session.user.name + " in " + session.user.studentClass.name + '\n')
      return session
    }
    
  } catch (err) {
    if (err.code === pronoteapi.errors.WRONG_CREDENTIALS.code) {
      console.error('Mauvais identifiants');
    } else {
      console.error(err);
    }
  }
  


}