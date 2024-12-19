    const utils = require("./utils")
const data = utils.loadData()

function creaGruppo(id,nome) {
    let gruppo = {
        idUnivocoGruppo: id,
        contatore: 1,
        nome: nome,
        giocatori: [],
        elencoPartite: []
    }
    data.gruppi.push(gruppo)
    utils.saveData(data)
}

function ottieniGiocatore(idGruppo, idGiocatore) {
    return idGruppo.giocatori.find(oggetto => oggetto.idUnivocoGiocatore == idGiocatore)
}

function aumentaPartiteOttieni(idGruppo, idGiocatore) {
    let g = ottieniGiocatore(idGruppo, idGiocatore)
    g.partiteGiocate++
    return g
}

function ottieniGruppo(id){
    return data.gruppi.find(oggetto => oggetto.idUnivocoGruppo == id)
}

function createUser(id,alias) {
    const esistenteGruppo = ottieniGruppo(id)

    let nuovoUtente = {
        idUnivocoGiocatore: esistenteGruppo.contatore,
        alias: [],
        partiteGiocate: 0,
        punti: 0
    }

    esistenteGruppo.contatore++
    esistenteGruppo.giocatori.push(nuovoUtente)

    let string = ""
    if(alias){
        nuovoUtente.alias.push(alias)
        string = `creato utente con id ${nuovoUtente.idUnivocoGiocatore} e alias ${alias}`
    } else
    string = `creato utente con id ${nuovoUtente.idUnivocoGiocatore} senza alias`
    utils.saveData(data)
    return string

}

function users(id){

    const esistenteGruppo = ottieniGruppo(id)

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
        return string
    else
        return "ERRORE: non ci sono utenti"
}

function partita(sx, dx, id){
    

    const esistenteGruppo = ottieniGruppo(id)

    if (sx.length + dx.length != 5) {
        return "bro, inserisci 5 giocatori"
    } else {
        let stringaDaSalvare = ""
        sx.forEach((item) => {
            stringaDaSalvare += item + " "
        });
        stringaDaSalvare += "/ "
        dx.forEach((item) => {
            stringaDaSalvare += item + " "
        });

        stringaDaSalvare.trimEnd()

        esistenteGruppo.elencoPartite.push(stringaDaSalvare)
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
        utils.saveData(data)
        return "Partita registrata con successo!"
    }

}

function classifica(id){


    const esistenteGruppo = ottieniGruppo(id)
    
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

        let posizione = i+1
        switch (posizione) {
            case 1:
                posizione = "🥇"
                break;
            case 2:
                posizione = "🥈"
                break;
            case 3:
                posizione = "🥉"
                break;
            default:
                break;
        }
        string += `<b>${posizione} \|</b> <i>${alias}</i>, ${array[i].punti}pt, id: ${array[i].idUnivocoGiocatore}\n`
    }
    if (string)
        return string
    else 
        return "ERRORE: non ci sono utenti"
}

function override(idGruppo, idGiocatore, punti){

    let g = ottieniGiocatore(ottieniGruppo(idGruppo),idGiocatore)
    if(g) {
        g.punti = parseInt(punti)
        utils.saveData(data)
        return "punti impostati con successo"
    } else {
        return "errore"
    }
}

function clear(id){

    const esistenteGruppo = ottieniGruppo(id)
    esistenteGruppo.giocatori = []
    esistenteGruppo.contatore = 0
    esistenteGruppo.elencoPartite = []
    utils.saveData(data)
    return "statistiche gruppo azzerate"
}

function undo(sx,dx,id){

    const esistenteGruppo = ottieniGruppo(id)

    if (sx.length + dx.length != 5) {
        return "bro, inserisci 5 giocatori"
    } else {
        let stringaDaTrovare = ""

        sx.forEach((item) => {
            stringaDaTrovare += item + " "
        });
        stringaDaTrovare += "/ "
        dx.forEach((item) => {
            stringaDaTrovare += item + " "
        });

        stringaDaTrovare.trimEnd()
        let elementoRicercato = esistenteGruppo.elencoPartite.find(oggetto => oggetto == stringaDaTrovare);

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
            utils.saveData(data)
            return "Partita annullata con successo!"
        }
        else return "Stai cercando di annullare una partita non esistente!"
    }
}

function addAlias(idGruppo,idGiocatore,alias){

    const esistenteGruppo = ottieniGruppo(idGruppo)

    let g = ottieniGiocatore(esistenteGruppo,idGiocatore)
    if(g){
        g.alias.push(alias)
        utils.saveData(data)
        return `Alias ${alias} impostato correttamente`
    } else {
        return "ERRORE, Giocatore non trovato"
    }
}

function 

module.exports = {
    createUser,
    users,
    partita,
    classifica,
    override,
    clear,
    undo,
    addAlias,
    ottieniGruppo,
    creaGruppo
}