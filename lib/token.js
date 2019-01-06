const Web3 = require('web3')
const path = require('path')
const cjson = require('cjson')
const TX = require('ethereumjs-tx')
// contract details
const provider = 'https://rinkeby.infura.io/v3/434a9c06f58c4dae99da196b33037370'
const contractAddress = '0xf1f283b9ac9af0b8b2f4e389b43973b6b53ccbfb'
const privateKey = new Buffer('CFEF0A53C0717693AEAF216D8DCF46C1358C3FEF23C30BD5F8285C6F1A57DEAC', 'hex') 
const defaultAccount = '0x86823E040B19d734E08c8DC79092D32ce1eA5Dc6'
const etherscanLink = 'https://rinkeby.etherscan.io/tx/'
// initiate the web3
const web3 = new Web3(provider)
// initiate the contract with null value
var contract = null;

// Initiate the Contract
function getContract() { 
 if (contract === null) {
 var abi = cjson.load(path.resolve(__dirname, '../ABI/abi.json'));
 var c = new web3.eth.Contract(abi,contractAddress)
 contract = c.clone();
 }
 console.log('Contract Initiated successfully!')
 return contract;
}

// create a game
async function createGame(req, res) {
   try{
 var homeTeam = req.body.homeTeam
 var awayTeam = req.body.awayTeam
if (homeTeam && awayTeam) {
 const rawTrans = getContract().methods.createGame(homeTeam,awayTeam) // contract method 
 return res.send(await sendSignTransaction(rawTrans))
 } else {
 res.send({
 'message':'Creation of game failed'
 })
 }} catch(err){console.log(err);}
}
// place a bet
async function placeBet(req, res) {
 var player = req.body.address
 var game_id = req.body.game_id
 var winningTeam = req.body.winningTeam
 var amount = req.body.amount

if (player && game_id && winningTeam && amount) {
 const rawTrans = getContract().methods.placeBet(player, game_id, winningTeam, amount) // contract method 
 return res.send(await sendSignTransaction(rawTrans))
 } else {
 res.send({
 'message':'Placing of bet failed'
 })
 }
}
// finish the game
async function finishGame(req, res) {
 var game_id = req.body.game_id
 var winningTeam = req.body.winningTeam
 if (game_id && winningTeam) {
    const rawTrans = getContract().methods.finishGame(game_id, winningTeam) // contract method 
    return res.send(await sendSignTransaction(rawTrans))
    } else {
    res.send({
    'message':'Closing the game failed'
    })
    }
   }
   
// Send Signed Transaction
async function sendSignTransaction(rawTrans) {
 // Initiate values required by the dataTrans
 if (rawTrans) {
 console.log('waiting for transactioncount')
 var txCount = await web3.eth.getTransactionCount(defaultAccount) // needed for nonce
 console.log('encode contract')
 var abiTrans = rawTrans.encodeABI() // encoded contract method 
 
 console.log('estimate gas')
 //var gas = await rawTrans.estimateGas()
 console.log('get gasprice')
 var gasPrice = await web3.eth.getGasPrice()
 gasPrice = Number(gasPrice)
 gasPrice = gasPrice * 2
 var gasLimit = 3000000 
// Initiate the transaction data
 var dataTrans = {
 nonce: web3.utils.toHex(txCount),
 gasLimit: web3.utils.toHex(gasLimit),
 gasPrice: web3.utils.toHex(gasPrice), 
 to: contractAddress,
 data: abiTrans 
 }
 
 // sign transaction
 console.log('signing transaction')
 var tx = new TX(dataTrans)
 tx.sign(privateKey)
// after signing send the transaction
console.log('sending the transaction')
 return await sendSigned(tx)
 } else {
 throw new console.error('Encoded raw transaction was not given.');
 }
 
}
function sendSigned(tx) {
 return new Promise(function(resolve,reject){
 // send the signed transaction
 web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
 .once("transactionHash", function(hash){
 var result = {
 'status':'sent',
 'url': etherscanLink + hash,
 'message':'click the given url to verify status of transaction'
 }
// respond with the result
 resolve(result)
 })
 .then(out => {console.log(out)})
 .catch(err => {
 // respond with error
 reject(err)
 })
 })
}
module.exports = {
 createGame: createGame,
 placeBet: placeBet,
 finishGame: finishGame
}
