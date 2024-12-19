const { createUser, partita, classifica, override, clear, undo, addAlias, users } = require("./endpoints")

require("./endpoints")
const functions = [
    {
        definition: {
            name: "addAlias",
            description: `addAlias(idGruppo,idUnivocoGiocatore, aliasNuovo)aggiungi un alias ad un giocatore, dato un suo vecchio alias ricava l'id del giocatore e inserisci il nuovo alias`,
            parameters: {
                type: "object",
                properties: {
                    idGruppo: { type: "string" },
                    idUnivoco: { type: "string"},
                    alias: { type: "string"}
                },
                required: ["idGruppo","idUnivoco","alias"]
            },
        },
        handler: (options) => {
            const {idGruppo,idUnivoco,alias } = options
            console.log("AID FORNITO: " + idUnivoco + " ALIAS NUOVO: " + alias);
            return addAlias(idGruppo,idUnivoco,alias)
        }
    },
    {
        definition: {
            name: "createUser",
            description: "crea un nuovo utente da 0, se viene passato un nome aggiungilo negli alias, se non passo alias passsa una stringa '' null ",
            parameters: {
                type: "object",
                properties: {
                    alias: { type: "string" },
                    idGruppo: { type: "string" }
                },
                required: ["alias", "idGruppo"]
            },
        },
        handler: (options) => {
            const {alias, idGruppo } = options
            return createUser(idGruppo,alias)
        }
    },
    {
        definition: {
            name: "users",
            description: "mostra tutti gli utenti",
            parameters: {
                type: "object",
                properties: {
                    idGruppo: { type: "string" }
                },
                required: ["idGruppo"]
            },
        },
        handler: (options) => {
            const {idGruppo } = options
            return users(idGruppo)
        }
    },
    {
        definition: {
            name: "partita",
            description: `calcola i punteggi di una partita: 
            verranno passati gli id di 5 giocatori di briscola 5,
            metti gli id di chi vince nell'array sx, metti gli id di chi perde nell'array dx,
            mettendo sempre nella squadra il chiamante come primo nell'array`,
            parameters: {
                type: "object",
                properties: {
                    sx: { type: "array", items: {type: "number"} },
                    dx: { type: "array", items: {type: "number"} },
                    id: { type: "string"}
                },
                required: ["sx","dx","id"]
            },
        },
        handler: (options) => {
            const {sx,dx,id } = options
            return partita(sx,dx,id)
        }
    },
    {
        definition: {
            name: "classifica",
            description: `mostra classifica e in risposta formatta con degli italici i nomi`,
            parameters: {
                type: "object",
                properties: {
                    id: { type: "string"}
                },
                required: ["id"]
            },
        },
        handler: (options) => {
            const {id } = options
            return classifica(id)
        }
    },
    {
        definition: {
            name: "override",
            description: `sovrascrivi i punteggi del giocatore fornito`,  
            parameters: {
                type: "object",
                properties: {
                    idGruppo: { type: "string"},
                    idGiocatore: { type: "string"},
                    punti: { type: "number"}
                },
                required: ["idGruppo","idGiocatore","punti"]
            },
        },
        handler: (options) => {
            const {idGruppo,idGiocatore,punti } = options
            return override(idGruppo,idGiocatore,punti)
        }
    },
    {
        definition: {
            name: "clear",
            description: `azzera i valori del gruppo`,  
            parameters: {
                type: "object",
                properties: {
                    id: { type: "string"},
                },
                required: ["id"]
            },
        },
        handler: (options) => {
            const {id} = options
            return clear(id)
        }
    },
    {
        definition: {
            name: "undo",
            description: `annulla una partita svolta precedentemnte: 
            verranno passati gli id di 5 giocatori di briscola 5,
            metti gli id di chi aveva vinto nell'array sx, metti gli id di chi aveva perso nell'array dx,
            mettendo sempre nella squadra il chiamante come primo nell'array`,
            parameters: {
                type: "object",
                properties: {
                    sx: { type: "array", items: {type: "number"} },
                    dx: { type: "array", items: {type: "number"} },
                    id: { type: "string"}
                },
                required: ["sx","dx","id"]
            },
        },
        handler: (options) => {
            const {sx,dx,id } = options
            return undo(sx,dx,id)
        }
    }
]

module.exports = {
    functions
}