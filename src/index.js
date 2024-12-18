const OpenAI = require("openai")
const { Telegraf } = require("telegraf")
const { message } = require("telegraf/filters")

const configs = require("./configs")
const utils = require("./utils")

/* ===================== SETUP ===================== */

const data = utils.loadData()
setInterval(() => utils.saveData(data), 5000)

const bot = new Telegraf(configs.TELEGRAM_BOT_TOKEN)
const openai = new OpenAI({
    apiKey: configs.OPENAI_API_KEY
})

/* ===================== BOT ===================== */

bot.start(async (ctx) => {
    const chatId = ctx.chat.id
    await ctx.reply(`Hello! Your chat ID is ${chatId}`)
})

const getUserId = (message) => {
    if (message.reply_to_message) {
      return message.reply_to_message.from.id;
    }
    return message.from.id;
};





bot.on(message("text"), async (ctx) => {
    const message = ctx.message.text
    const message0 = message.split(" ")[0]
    const message1 = message.split(" ")[1]
    const idGiocatore = getUserId(ctx.message)
    const idGruppo = ctx.chat.id
    let nuovoGruppo = {idUnivocoGruppo: idGruppo}
    let esistenteGruppo = data.gruppi.find(oggetto => oggetto.idUnivocoGruppo === nuovoGruppo.idUnivocoGruppo)
    if(!esistenteGruppo){
        esistenteGruppo = {
            idUnivocoGruppo: idGruppo,
            nome : "NOME DI PROVA",
            giocatori : []
        }
        data.gruppi.push(esistenteGruppo)
    }

    switch (message0){
        case "/users":
            //scrivere tutti gli utenti

            break;
        case "/createUser":
            //creare utente con id2, /createUser <userId>
            esistenteGruppo.giocatori.push({
                idUnivocoGiocatore: message1,
                alias : [],
                partiteGiocate: 0,
                punti : 0
            })

            break;
        case "/addAlias": //addAlias <userId> <alias>
            //aggiungiamo alias
                const x = message.split(" ")
                const id = x[1]
                const alias = x[2]
                




                break;
        case "/partita":
            break;
        case "/classifica":
            //buttare fuori la classifica
            break;
    }



    if (message == "+1"){
        await ctx.reply(`adesso ti aggiungo un punto`)
        
        const idGruppo = ctx.chat.id
        let nuovoGruppo = {idUnivocoGruppo: idGruppo}
        let esistenteGruppo = data.gruppi.find(oggetto => oggetto.idUnivocoGruppo === nuovoGruppo.idUnivocoGruppo)
        
        if(!esistenteGruppo){
            esistenteGruppo = {
                idUnivocoGruppo: idGruppo,
                nome : "NOME DI PROVA",
                giocatori : []
            }
            data.gruppi.push(esistenteGruppo)
        }

        const idGiocatore = getUserId(ctx.message)
        let nuovoGiocatore = {idUnivocoGiocatore: idGiocatore}
        let esistenteGiocatore = esistenteGruppo.giocatori.find(oggetto => oggetto.idUnivocoGiocatore === nuovoGiocatore.idUnivocoGiocatore)
        
        if (!esistenteGiocatore)
        {
            esistenteGiocatore = {
                idUnivocoGiocatore: idGiocatore,
                alias: [],
                punti: 1,
                partiteGiocate: 1
            }
            esistenteGruppo.giocatori.push(esistenteGiocatore)
        }
        else {
            esistenteGiocatore.punti++
            esistenteGiocatore.partiteGiocate++
        }
        


    } else {
        await ctx.reply(`Hai detto: ${message},${getUserId(ctx.message)}`)
    }

    
})

/* ===================== LAUNCH ===================== */

bot.launch(() => {
    console.log('Bot is up and running')
}).catch((err) => {
    console.error('Error starting bot', err)
})

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))