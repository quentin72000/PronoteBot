require('dotenv').config();
let {PronoteSession, login: sessionLogin, errors} = require("pronote-api-maintained");


module.exports = { login, logout };

/**
    * Login in a PronoteApi session
     * @param {Bolean} keepAlive Set if the session should last more than 10 minutes or not. (Dont forgot to `session.setKeepAlive(false)` before login out.)
     * 
     * @returns {PronoteSession} Return a logged in PronoteAPI session. 
     */

async function login(keepAlive) {
  try {
    const session = await sessionLogin(process.env.PRONOTE_URL, process.env.PRONOTE_USERNAME, process.env.PRONOTE_PASSWORD, process.env.CAS ? process.env.CAS : "none");
    session.setKeepAlive(keepAlive, error => {
      console.log(error);
    });
    if(session.user !== null && session.user != undefined) {
      console.log(`Succesfully logged as ${session.user.name} in ${session.user.studentClass.name}. Session id: ${session.id} \n`)
      return session
    }
    
  } catch (err) {
    if (err.code === errors.WRONG_CREDENTIALS.code) {
      console.error('Mauvais identifiants');
    } else {
      console.error(err);
    }
  }  
}


/**
    * Login in a PronoteApi session
     * @param {PronoteSession} session The PronoteAPI session to logout.
     * 
     * @param {String} taskName The name of the task that the session belongs. 
     */

async function logout(session, taskNameOrCommand) {
  await session.logout().then(() => {
    
    console.log(`Logged out of session ${session.id} of the ${taskNameOrCommand.startsWith("/") ? "command" : "task"} ${taskNameOrCommand}.` )
  })
}