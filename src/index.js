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


bot.on(message("text"), async (ctx) => {
    const message = ctx.message.text

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
        } else {
            esistenteGruppo.nome = "NOME CAMBIATO"
            
        }



    } else {
        await ctx.reply(`Hai detto: ${message}`)
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