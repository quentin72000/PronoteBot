// const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config();

const puppeteerArgs = [
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
];

const puppeteer = require('puppeteer')
// const puppeteer = require('puppeteer-extra')


// add stealth plugin and use defaults (all evasion techniques)
// const StealthPlugin = require('puppeteer-extra-plugin-stealth') // use to make the site dont think that not a human
// puppeteer.use(StealthPlugin())

module.exports = {
  getMoyenne: getMoyenne,
  login: login,
  checkAbsentProfORCoursAnnule: checkAbsentProfORCoursAnnule,
  getAllData: getAllData
}




async function login(callback) {
  (async () => {
    const browser = await puppeteer.launch({
      headless: false,
      args: puppeteerArgs
    });


    const page = await browser.newPage();

    // optimization part

    await page.setRequestInterception(true);

    //if the page makes a  request to a resource type of image then abort that request
    page.on('request', request => {
      if (request.resourceType() === 'image')
        request.abort();
      else
        request.continue();
    });

    console.log('Browser launched ! Going to login')

    await page.goto('https://ent.l-educdenormandie.fr/auth/login?callback=%2Fcas%2Flogin%3Fservice%3Dhttps%253A%252F%252F0610056E.index-education.net%252Fpronote%252Feleve.html#/'); // va sur la page de login de l'ent qui redirige sur pronote


    // Login
    await page.waitForSelector('#email')
    await page.type("input[id=email]", process.env.ENT_USERNAME) // écrit le username dans le champ approprié
    await page.type("input[id=password]", process.env.PASSWORD) // écrit le password dans le champ approprié
    await page.$eval('button[class=flex-magnet-bottom-right]', el => el.click()); // click sur le bouton de login

    // Wait Pronote Loading
    // await page.waitForNavigation({waitUntil: 'networkidle2'});
    // await page.waitForSelector(".ObjetBandeauEspace")
    // await page.waitForSelector(".edt-global-wrapper")

    // console.log("Login successfully !");
    // await page.waitForSelector('.liste_contenu_ligne')

    // await browser.close();
    callback(browser, page)

  })();
}


async function getMoyenne(callback) { // OBSELETE || DEPRECATED (replaced by getAllData())
  login(async (browser, page) => {

    // await page.waitForFunction("document.querySelector('#GInterface\\.Instances[0]\\.Instances[1]_Combo2')")
    await page.evaluate(() => {
      document.getElementById("GInterface.Instances[0].Instances[1]_Combo2").click()
    });

    await page.waitForFunction('document.querySelector("body").innerText.includes("Moyenne générale élève : ")')
    const user_average_element = await page.$x("/html/body/div[4]/div/div[2]/table/tbody/tr/td/div/div/div[2]/div/div[2]/div/div[1]/div/span/span");
    const class_average_element = await page.$x("/html/body/div[4]/div/div[2]/table/tbody/tr/td/div/div/div[2]/div/div[2]/div/div[1]/div[2]/span/span");
    // const user_matieres = await page.$x("/html/body/div[4]/div/div[2]/table/tbody/tr/td/div/div/div[2]/div/div[1]");



    let user_average = await page.evaluate(el => el.innerHTML.replaceAll(' ', '').replace(",", "."), user_average_element[0]);
    let class_average = await page.evaluate(el => el.innerHTML.replaceAll(' ', '').replace(",", "."), class_average_element[0]);
    browser.close()
    console.log("Browser closed!")
    callback(parseFloat(user_average), parseFloat(class_average));
  })

}

async function checkAbsentProfORCoursAnnule(callback) { // OBSELETE || DEPRECATED (replaced by getAllData())
  login(async (browser, page) => {
    let result = await page.evaluate(async () => {

      let numberofabsentproff = null
      let numberofcoursannule = null
      if ($("*").html().match(/Prof. absent/gi)) numberofabsentproff = $("*").html().match(/Prof. absent/gi).length
      if ($("*").html().match(/Cours annulé/gi)) numberofcoursannule = $("*").html().match(/Cours annulé/gi).length

      // var xpath = "//div[text()='Prof. absent']";
      // var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      // console.log(matchingElement.nextElementSibling)
      // if(matchingElement != null){
      //   return true;
      // }else return false;



      //     [...document.querySelectorAll("div")]
      //  .filter(a => a.textContent.includes("Prof. absent"))
      //  .forEach(a => console.log(a.textContent))

      return {
        absent: numberofabsentproff,
        annule: numberofcoursannule
      }
    })
    callback(result)
    browser.close()
    console.log('Browser closed.')
    // console.log(result.absent)
  })
}

async function getAllData(callback) {
  return new Promise((resolve, reject) => {
    let reponse = {
      params: null,
      accueil: null,
      notes: null
    }
    login(async (browser, page) => { // execute la fonction login, puis attend le retour des requete de l'API de pronote.
      page.on("response", async res => {
        if ((res.status() >= 300) && (res.status() <= 399)) {
          return;
        } // si la requete est redirigé, passé (fix bug "Error: Response body is unavailable for redirect responses")
        let resText = await res.text();
        if (IsJsonString(resText)) {
          let value = IsJsonString(resText);
          // console.log(value.nom) // debug


          if (value.nom === "FonctionParametres") { // si la requete à le nom voulu, enrigstrer la valeur dans reponse.
            console.log("Param response retrieved.");
            reponse.params = value.donneesSec.donnees;
          } else if (value.nom === "PageAccueil") {
            console.log("Accueil page response retrieved.");
            reponse.accueil = value.donneesSec.donnees;
          }
          if (reponse.params && reponse.accueil) { // Si les deux valeurs de la page acceuil sont recup: continuer
            if (value.nom === "DernieresNotes") {
              console.log("Note page response retrieved.");
              reponse.notes = value.donneesSec.donnees;
              let jsonreponses = JSON.stringify(reponse)
              fs.writeFileSync("db.json", jsonreponses)

              resolve(callback(reponse))
              await browser.close();
              return;
            } else if (value.nom === "Navigation") {} else {
              await page.$eval('[id="GInterface.Instances[0].Instances[1]_Combo2"]', el => el.click()); // click sur le bouton de login

            }

          }
        }
      })
    })
  })
}


const IsJsonString = str => {
  try {
    JSON.parse(str);
    return JSON.parse(str);
  } catch (e) {
    return false;
  }
};