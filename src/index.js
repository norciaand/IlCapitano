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

function ottieniGiocatore(gruppo, id) {
    return g = gruppo.giocatori.find(oggetto => oggetto.idUnivocoGiocatore == id)
}

function aumentaPartiteOttieni(gruppo, id) {
    let g = ottieniGiocatore(gruppo, id)
    g.partiteGiocate++
    return g
}

function ottieniGruppo(ctx) {
    const idGruppo = ctx.chat.id
    let nuovoGruppo = { idUnivocoGruppo: idGruppo }
    let esistenteGruppo = data.gruppi.find(oggetto => oggetto.idUnivocoGruppo === nuovoGruppo.idUnivocoGruppo)
    if (!esistenteGruppo) {
        esistenteGruppo = {
            idUnivocoGruppo: idGruppo,
            contatore: 0,
            nome: "NOME DI PROVA",
            giocatori: []
        }
        data.gruppi.push(esistenteGruppo)
    }

    return esistenteGruppo
}

bot.command('partita', async (ctx) => {
    const message = ctx.message.text
    esistenteGruppo = ottieniGruppo(ctx)

    const squadre = message.split("/partita ")[1].split(" / ")
    console.log(squadre)
    const sx = squadre[0].split(" ")
    const dx = squadre[1].split(" ")

    if(sx.length + dx.length != 5){
        await ctx.reply("BRO, inserisci 5 giocatori")
    } else {
        switch (sx.length) {
            case 1:
                aumentaPartiteOttieni(esistenteGruppo, sx[0]).punti += 4
                dx.forEach(element => {
                    aumentaPartiteOttieni(esistenteGruppo, element).punti -= 1
                });
                break
            case 4:
                sx.forEach(element => {
                    aumentaPartiteOttieni(esistenteGruppo, element).punti += 1
                });
                aumentaPartiteOttieni(esistenteGruppo, dx[0]).punti -= 4
                break
            case 2:
                aumentaPartiteOttieni(esistenteGruppo, sx[0]).punti += 2
                aumentaPartiteOttieni(esistenteGruppo, sx[1]).punti += 1
                dx.forEach(element => {
                    aumentaPartiteOttieni(esistenteGruppo, element).punti -= 1
                });
                break
            case 3:
                sx.forEach(element => {
                    aumentaPartiteOttieni(esistenteGruppo, element).punti += 1
                });
                aumentaPartiteOttieni(esistenteGruppo, dx[0]).punti -= 2
                aumentaPartiteOttieni(esistenteGruppo, dx[1]).punti -= 1
                break
        }
   
    }

})

bot.command('undo', async (ctx) => {
    const message = ctx.message.text
    esistenteGruppo = ottieniGruppo(ctx)

    const squadre = message.split("/undo ")[1].split(" / ")
    console.log(squadre)
    const sx = squadre[0].split(" ")
    const dx = squadre[1].split(" ")

    if(sx.length + dx.length != 5){
        await ctx.reply("BRO, inserisci 5 giocatori")
    } else {
        switch (sx.length) {
            case 1:
                aumentaPartiteOttieni(esistenteGruppo, sx[0]).punti -= 4
                dx.forEach(element => {
                    aumentaPartiteOttieni(esistenteGruppo, element).punti += 1
                });
                break
            case 4:
                sx.forEach(element => {
                    aumentaPartiteOttieni(esistenteGruppo, element).punti -= 1
                });
                aumentaPartiteOttieni(esistenteGruppo, dx[0]).punti += 4
                break
            case 2:
                aumentaPartiteOttieni(esistenteGruppo, sx[0]).punti -= 2
                aumentaPartiteOttieni(esistenteGruppo, sx[1]).punti -= 1
                dx.forEach(element => {
                    aumentaPartiteOttieni(esistenteGruppo, element).punti += 1
                });
                break
            case 3:
                sx.forEach(element => {
                    aumentaPartiteOttieni(esistenteGruppo, element).punti -= 1
                });
                aumentaPartiteOttieni(esistenteGruppo, dx[0]).punti += 2
                aumentaPartiteOttieni(esistenteGruppo, dx[1]).punti += 1
                break
        }
    }


})

bot.command('users', async (ctx) => {
    esistenteGruppo = ottieniGruppo(ctx)

    let string = ""
    esistenteGruppo.giocatori.forEach((item) => {
        let alias
        if (item.alias[0])
            alias = item.alias[0]
        else
            alias = "non assegnato"
        string += ("ID: " + item.idUnivocoGiocatore + " ALIAS: " + alias + " PUNTI: " + item.punti + "\n")
    });

    await ctx.reply(string)
})

bot.command('createUser', async (ctx) => {
    esistenteGruppo = ottieniGruppo(ctx)
    const message = ctx.message.text

    let nuovoUtente = {
        idUnivocoGiocatore: esistenteGruppo.contatore,
        alias: [],
        partiteGiocate: 0,
        punti: 0
    }

    if (message.split(" ")[1]) {
        nuovoUtente.alias.push(message.split(" ")[1])
        await ctx.reply("Creato utente ID:" + esistenteGruppo.contatore + " con alias:" + message.split(" ")[1])
    } else {
        await ctx.reply("Creato utente ID:" + esistenteGruppo.contatore + " senza alias")
    }

    esistenteGruppo.giocatori.push(nuovoUtente)
    esistenteGruppo.contatore++
})

bot.command('addAlias', async (ctx) => {
    const message = ctx.message.text
    esistenteGruppo = ottieniGruppo(ctx)
    const x = message.split(" ")
    const id = x[1]

    console.log(x)

    let g = esistenteGruppo.giocatori.find(oggetto => oggetto.idUnivocoGiocatore == id)
    g.alias.push(x[2])

})

bot.command('override', async (ctx) => {
    const message = ctx.message.text
    esistenteGruppo = ottieniGruppo(ctx)
    const userId = message.split(" ")[1]
    const punti = message.split(" ")[2]

    ottieniGiocatore(ottieniGruppo(ctx),userId).punti = parseInt(punti)
})

bot.command('clear', async (ctx) => {
    esistenteGruppo = ottieniGruppo(ctx)
    esistenteGruppo.giocatori = []
    esistenteGruppo.contatore = 0
}) 

bot.command('classifica', async (ctx) => {
    esistenteGruppo = ottieniGruppo(ctx)

    let string = ""
    let array = []
    esistenteGruppo.giocatori.forEach((item) => {
        array.push(item)
    });

    array.sort((a,b) => b.punti - a.punti)
    for (i = 0; i < array.length; i++){
        let alias
        if (array[i].alias[0])
            alias = array[i].alias[0]
        else
            alias = "alias non assegnato"

        string += i+1 + "°) " + alias + " (id: " + array[i].idUnivocoGiocatore+ ") con " + array[i].punti+" PUNTI\n"
    }
    await ctx.reply(string)
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