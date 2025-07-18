import 'dotenv/config';
import { OpenAI } from 'openai';
import { systemPrompt } from './systemPrompt.js';
import {getContext} from './context.ts';

console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY.substring(0, 7) + '...'); // Log only the first 4 characters for security
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: DEEPSEEK_API_KEY
});



let communicationhistoryList = [{"contact": "contact", "role": "role", "content": "content"}];

async function getResponseFromDeepSeek(userQuery) {
    // console.log('Sending query to DeepSeek:', userQuery);
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userQuery }],
            model: "deepseek-chat",
        });
        return completion.choices[0].message.content;
    } catch (error) {
        // console.error('Error calling DeepSeek API:', error);
        return 'Sorry, something went wrong. We are experiencing very high traffic. Please try again later. ';
    }
}



export async function handle_NewMessage(msg) {

    const userNumber = msg.from;
    const userMessagesContext = communicationhistoryList.filter(item => item.contact === userNumber);
    const commsHistoryString = JSON.stringify(userMessagesContext);
    const userInput = msg.body.trim();
    let context = getContext(userInput);

    try {    

        communicationhistoryList.push({"contact": userNumber, "role": "user", "content": userInput});
        const query = `chatHistory: ${commsHistoryString} question: ${userInput} context: ${context}`;

        const response = await getResponseFromDeepSeek(query);
        console.log('Response from DeepSeek:', response);
        communicationhistoryList.push({"contact": userNumber, "role": "system", "content": response});

    } catch (error) {
        console.error('Error handling message:', error);
        await msg.reply('Sorry, an error occurred. Please try again.');
    }
}

// const Bot = new loop();
handle_NewMessage({
    from: '1234567890',
    body: 'Hello, I need help with my kamande.'
}).then(() => {
    console.log('Message processed successfully.');
}).catch((error) => {
    console.error('Error processing message:', error);
});
