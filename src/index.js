const OpenAI = require("openai")
const { Telegraf } = require("telegraf")
const { message } = require("telegraf/filters")
const { completionWithFunctions } = require("./utils")
const { functions } = require("./functions")
const configs = require("./configs")
const utils = require("./utils")
const { ottieniGruppo, users, override, classifica, undo, partita, createUser, addAlias, clear, creaGruppo } = require("./endpoints")
require("./endpoints")
const fs = require('fs')

/* ===================== SETUP ===================== */

const data = utils.loadData()
//setInterval(() => utils.saveData(data), 5000)

const bot = new Telegraf(configs.TELEGRAM_BOT_TOKEN)
const openai = new OpenAI({
    apiKey: configs.OPENAI_API_KEY
})

/* ===================== BOT ===================== */
let botName = ""
bot.telegram.getMe()
    .then((botInfo) => {
        botName = botInfo.username;
    })
    .catch((err) => {
        console.error('Errore durante il recupero delle informazioni del bot:', err);
    });

bot.start(async (ctx) => {
    const chatId = ctx.chat.id
    await ctx.reply(`Hello! Your chat ID is ${chatId}`)

})

bot.command('partita', async (ctx) => {
    if(!ottieniGruppo(ctx.chat.id)){
        creaGruppo(ctx.chat.id, ctx.chat.title)
    }

    const message = ctx.message.text

    const contMess = message.split(" ")[1]
    if (contMess) {
        const squadre = message.split("/partita ")[1].split(" / ")
        console.log(squadre)
        const sx = squadre[0].split(" ")
        const dx = squadre[1].split(" ")

        await ctx.reply(partita(sx, dx, ctx.chat.id))

    }

})

bot.command('undo', async (ctx) => {
    if(!ottieniGruppo(ctx.chat.id)){
        creaGruppo(ctx.chat.id, ctx.chat.title)
    }

    const message = ctx.message.text

    const contMess = message.split(" ")[1]
    if (contMess) {
        const squadre = message.split("/undo ")[1].split(" / ")
        console.log(squadre)
        const sx = squadre[0].split(" ")
        const dx = squadre[1].split(" ")

        await ctx.reply(undo(sx, dx, ctx.chat.id))
    }

})

bot.command('users', async (ctx) => {
    if(!ottieniGruppo(ctx.chat.id)){
        creaGruppo(ctx.chat.id, ctx.chat.title)
    }
    await ctx.reply(users(ctx.chat.id))
})

bot.command('createUser', async (ctx) => {
    if(!ottieniGruppo(ctx.chat.id)){
        creaGruppo(ctx.chat.id, ctx.chat.title)
    }
    const message = ctx.message.text
    await ctx.reply(createUser(ctx.chat.id,message.split(" ")[1]??""))
})

bot.command('addAlias', async (ctx) => {
    if(!ottieniGruppo(ctx.chat.id)){
        creaGruppo(ctx.chat.id, ctx.chat.title)
    }
    const message = ctx.message.text
    await ctx.reply(addAlias(ctx.chat.id, message.split(" ")[1],message.split(" ")[2]))

})

bot.command('override', async (ctx) => {
    if(!ottieniGruppo(ctx.chat.id)){
        creaGruppo(ctx.chat.id, ctx.chat.title)
    }
    const message = ctx.message.text
    await ctx.reply(override(ctx.chat.id, message.split(" ")[1],message.split(" ")[2]))    
})

bot.command('clear', async (ctx) => {
    if(!ottieniGruppo(ctx.chat.id)){
        creaGruppo(ctx.chat.id, ctx.chat.title)
    }
    await ctx.reply(clear(ctx.chat.id))
}) 

bot.command('classifica', async (ctx) => {
    if(!ottieniGruppo(ctx.chat.id)){
        creaGruppo(ctx.chat.id, ctx.chat.title)
    }
    await ctx.reply(classifica(ctx.chat.id), {parse_mode: "HTML"})
})

bot.command('immagineClassifica', async (ctx) => {
    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: "mostra la classifica seguente in immagine, con i vari nomi e i punteggi: " + classifica(ctx.chat.id) + "\n non inserire altro rispetto a cio che è stato chiesto. l'ambientzione è un tavolo da briscola",
        n: 1,
        size: "1024x1024",
        });
        image_url = response.data[0].url;

        await ctx.replyWithPhoto(image_url)

})

bot.command('audioClassifica', async (ctx) => {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-audio-preview",
        modalities: ["text", "audio"],
        audio: { voice: "alloy", format: "wav" },
        messages: [
          {
            role: "user",
            content: "riproduci la classifica in modo epico" + classifica(ctx.chat.id)
          }
        ]
    });

    let audioBase64 = response.choices[0].message.audio.data;
    let audioBuffer = Buffer.from(audioBase64, 'base64');
    const filePath = "./audio.wav";
    fs.writeFileSync(filePath, audioBuffer);
    await ctx.replyWithVoice({ source: filePath });
    fs.unlinkSync(filePath);

})

bot.command('list', async (ctx) =>{
    await ctx.reply(`ELENCO COMANDI:\n
*/users*  \\-  _Mostra gli utenti_
*/createUser*  \\-  _Crea utente senza alias e id progressivo_
*/createUser \\\<alias\\>*  \\-  _Crea utente con alias id progressivo_
*/addAlias \\<id\\> \\<alias\\>*  \\-  _Aggiunge alias a un utente con un certo id_
*/partita \\<id\\> \\<id\\> / \\<id\\> \\<id\\> \\<id\\>*  \\-  _Imposta i punti dopo una partita_
*/classifica*  \\-  _Mostra la classifica_
*/override \\<id\\> \\<valorePunti\\>*  \\-  _Sovrascrive punti_
*/undo \\<id\\> \\<id\\> / \\<id\\> \\<id\\> \\<id\\>*  \\-  _Annulla una partita_
*/clear*  \\-  _Cancella tutti gli utenti e partite_
`, {parse_mode: "MarkdownV2"})
})

bot.on('text', async (ctx) => {
    if(!ottieniGruppo(ctx.chat.id)){
        creaGruppo(ctx.chat.id, ctx.chat.title)
    }

    if (ctx.message.text.startsWith('@'+botName)) {

        const giocatori = ottieniGruppo(ctx.chat.id).giocatori

        const res = await completionWithFunctions({
            openai,
            functions,
            messages: [{ role: "system", content: "id gruppo:" + ctx.chat.id + "array giocatori con i loro alias:" + giocatori }],
            prompt: ctx.message.text.split('@'+botName)[1] 
        })

        await ctx.reply(res)

    }
});




/* ===================== LAUNCH ===================== */

bot.launch(() => {
    console.log('Bot is up and running')
}).catch((err) => {
    console.error('Error starting bot', err)
})

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))