require("dotenv").config();
const TelegramBot = require('node-telegram-bot-api');

const chatId = process.env.chatid
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.token;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});


const botSendMessage = (msgToBot) => {

  bot.sendMessage(chatId,msgToBot)

}

botSendMessage("Telegram Monit Bot\n Monitorizacion basada en API EMQX")
module.exports = {botSendMessage};