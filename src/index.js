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
            giocatori: [],
            elencoPartite: []
        }
        data.gruppi.push(esistenteGruppo)
    }

    return esistenteGruppo
}

bot.command('partita', async (ctx) => {
    const message = ctx.message.text
    esistenteGruppo = ottieniGruppo(ctx)

    const contMess = message.split(" ")[1]
    if (contMess) {
        const squadre = message.split("/partita ")[1].split(" / ")
        console.log(squadre)
        const sx = squadre[0].split(" ")
        const dx = squadre[1].split(" ")

        if (sx.length + dx.length != 5) {
            await ctx.reply("BRO, inserisci 5 giocatori")
        } else {
            esistenteGruppo.elencoPartite.push(message.split("/partita ")[1])
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
    } else await ctx.reply("ERRORE")

})

bot.command('undo', async (ctx) => {
    const message = ctx.message.text
    esistenteGruppo = ottieniGruppo(ctx)
    const contMess = message.split(" ")[1]
    if (contMess) {
        const squadre = message.split("/undo ")[1].split(" / ")
        console.log(squadre)
        const sx = squadre[0].split(" ")
        const dx = squadre[1].split(" ")

        if (sx.length + dx.length != 5) {
            await ctx.reply("BRO, inserisci 5 giocatori")
        } else {

            let elementoRicercato = esistenteGruppo.elencoPartite.find(oggetto => oggetto == message.split("/undo ")[1]);

            if (elementoRicercato) {

                let index = esistenteGruppo.elencoPartite.findIndex(elemento => elemento == elementoRicercato);

                if (index !== -1) {
                    esistenteGruppo.elencoPartite.splice(index, 1);
                }

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
            } else {
                await ctx.reply("BRO, non puoi annullare una partita non giocata")
            }

        }
    }else await ctx.reply("ERRORE")

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

    if(string)
        await ctx.reply(string)
    else
        await ctx.reply("ERRORE: non ci sono utenti")
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

    let g = ottieniGiocatore(esistenteGruppo,id)
    if(g){
        g.alias.push(x[2])
    } else {
        await ctx.reply("ERRORE")
    }
    

})

bot.command('override', async (ctx) => {
    const message = ctx.message.text
    esistenteGruppo = ottieniGruppo(ctx)
    const userId = message.split(" ")[1]
    const punti = message.split(" ")[2]

    let g = ottieniGiocatore(ottieniGruppo(ctx),userId)
    if(g) g.punti = parseInt(punti)
    else await ctx.reply("ERRORE")
    
})

bot.command('clear', async (ctx) => {
    esistenteGruppo = ottieniGruppo(ctx)
    esistenteGruppo.giocatori = []
    esistenteGruppo.contatore = 0
    esistenteGruppo.elencoPartite = []
    await ctx.reply("elenco giocatori RESETTATO")
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
    if (string)
        await ctx.reply(string)
    else 
    await ctx.reply("ERRORE: non ci sono utenti")
})

bot.command('list', async (ctx) =>{
    await ctx.reply(`ELENCO COMANDI:\n        
/users    Mostra gli utenti
/createUser    Crea utente senza alias (id progressivo)
/createUser <alias>    Crea utente con alias (id progressivo)
/addAlias <id> <alias>    Aggiunge alias a un utente con un certo id
/partita <id> <id> / <id> <id> <id>    Aggiunge e toglie i punti
/classifica    Mostra la classifica
/override <id> <valorePunti>    Riscrive i punti di un giocatore
/undo <id> <id> / <id> <id> <id>    Annulla una partita (solo partite effettuate)
/clear    Cancella tutti gli utenti e partite
`)
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