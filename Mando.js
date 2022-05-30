import { Configuration, OpenAIApi } from "openai";
import Discord from "discord.js";
import { request } from "undici";
import dotenv from "dotenv";

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
let channel = client.channels.cache.get(process.env.TEST_SPACE_CHANNEL);
dotenv.config();

// loggin the bot in
client.login(process.env.TEST_SPACE_CHANNEL);

// logged in and ready
client.on("ready", async () => {

  let WelcomeMessage = 'Hi !\nYou can say hello, ask me for a quote or soon to be able to pass you a cat when you ask for one.\nFor whatever purpose a person might use a cat for :>\n*Whats new today is now i have an opinion !\nAsk me about anything in your mind (just include my name the sentence) and i will give you my input on that.\nOh hey btw please make sure im online before you text me this is just temporary until i make my way to the cloud.*';

  setInterval(() => {
    channel.send(WelcomeMessage);
  }, 500000);

  // testing space

})

// replying to message scenarios 
client.on("messageCreate", async msg => {
  var Message = msg.content.toLowerCase();
  let response;
  switch (Message) {
    case "ping":
      msg.reply("pong");
      break;
    case "test":
      msg.reply("this is testout");
      break;
    case "hi":
      msg.reply({ content: 'Hello!', components: [row] })
      break;
    case "hello":
      msg.reply("Hello friend.");
      setTimeout(() => {
        msg.reply("Hello friend? That's lame. Maybe I should give you a name?");
      }, 3000);
      setTimeout(() => {
        msg.reply("But that’s a slippery slope. You’re only in my head. We have to remember that.");
      }, 4500);
      break;
    case "cat please":
      let channel = client.channels.cache.get(process.env.TEST_SPACE_CHANNEL);
      response = await request('https://aws.random.cat/meow');
      if (response.statusCode != 200) {
        msg.reply('No cats around at the moment')
        break;
      }
      const { file } = await getJSONResponse(response.body);
      channel.send({
        files: [file.toString()]
      })
      break;
    case "quote please":
      response = await request('http://loremricksum.com/api/?paragraphs=1&quotes=1')
      const quote = await getJSONResponse(response.body);
      msg.reply(quote.data.toString());
      break;
    default:

      // still not working properly
      if (Message.includes("mando")) {
        Message = Message.replace("mando", "")
        const configuration = new Configuration({
          apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        const response = await openai.createCompletion("text-davinci-002", {
          prompt: Message,
          temperature: 0.5,
          max_tokens: 60,
          top_p: 0.3,
          frequency_penalty: 0.5,
          presence_penalty: 0,
        });
        msg.reply(response.data.choices[0].text)
      }
      break;
  }
})

// helper functions

async function getJSONResponse(body) {
  let fullBody = '';
  for await (const data of body) {
    fullBody += data.toString();
  }
  return JSON.parse(fullBody);
}