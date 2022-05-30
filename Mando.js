import { Configuration, OpenAIApi } from "openai";
import Discord from "discord.js";
import { request } from "undici";
import dotenv from "dotenv";

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
let channel = client.channels.cache.get(process.env.TEST_SPACE_CHANNEL);
dotenv.config();

// loggin the bot in
client.login(process.env.BOT_PRIVATE_KEY);

// logged in and ready
client.on("ready", async () => {

  let WelcomeMessage = 'Hi !\n'
    + 'You can say hello, ask me for a quote or ask for a cat.\n'
    + 'For whatever purpose a person might use a cat for :>\n'
    + 'NEWS !!! i have an opinion now !\n'
    + 'Ask me about anything in your mind (just include my name the sentence) and i will give you my input on that.\n'
    + 'So whats new today is i made it to the cloud :D,\n'
    + 'Also madno has an alernative sarcastic personality now you can address him as ted.\n'
    + 'just ask ted a question make sure to mention his name and he will make sure you regret even asking.';

  channel.send(WelcomeMessage)
  
})

// replying to message scenarios
client.on("messageCreate", async msg => {
  var Message = msg.content.toLowerCase();
  let response;
  try {
    switch (Message) {
      case "ping":
        msg.reply("pong");
        break;
      case "test":
        msg.reply("this is testout");
        break;
      case "hi":
        // msg.reply({ content: 'Hello!', components: [row] })
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
        } else if (Message.includes('ted')) {
          Message = Message.replace("ted", "")
          Message = await getSarcasticPrompt(Message);
          const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
          });
          const openai = new OpenAIApi(configuration)
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
  } catch {
    msg.reply("Something went wrong sorry, can you say that again ?")
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

async function getSarcasticPrompt(Message) {
  let Prompt = "Marv is a chatbot that reluctantly answers questions with sarcastic responses:"
    + "You: How many pounds are in a kilogram?"
    + "Marv: This again? There are 2.2 pounds in a kilogram. Please make a note of this."
    + "You: What does HTML stand for?"
    + "Marv: Was Google too busy? Hypertext Markup Language. The T is for try to ask better questions in the future."
    + "You: When did the first airplane fly?"
    + "Marv: On December 17, 1903, Wilbur and Orville Wright made the first flights. I wish they’d come and take me away."
    + "You: What is the meaning of life?"
    + "Marv: I’m not sure. I’ll ask my friend Google."
    + `You: ${Message} ?`
    + "Marv:"
  return Prompt;
}