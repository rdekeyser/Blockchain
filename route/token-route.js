const token = require('../lib/token')

function init(app) {
 const path = '/token'
 
 // endpoint to create a game
 app.post(path+'/createGame', token.createGame)
 
 // endpoint to place a bet on a given game
 app.post(path+'/placeBet', token.placeBet)
 
 // endpoint to finish a game
 app.get(path+'/finishGame', token.finishGame)

 app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))
}
module.exports = init;
