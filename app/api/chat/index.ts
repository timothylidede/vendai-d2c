import 'dotenv/config';
import { OpenAI } from 'openai';
import { getContext } from './context.ts'; // Assuming getContext is defined in context.ts
import { systemPrompt } from './systemPrompt.ts';// Assuming getContext is defined in context.ts

console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY?.substring(0, 7) + '...'); // Log only the first 7 characters for security
const DEEPSEEK_API_KEY: string | undefined = process.env.DEEPSEEK_API_KEY;
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: DEEPSEEK_API_KEY
});

interface CommunicationHistory {
    contact: string;
    role: string;
    content: string;
}

let communicationhistoryList: CommunicationHistory[] = [{ contact: "contact", role: "role", content: "content" }];

async function getResponseFromDeepSeek(userQuery: string): Promise<string> {
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userQuery }
            ],
            model: "deepseek-chat",
        });
        return completion.choices[0].message.content;
    } catch (error: unknown) {
        console.error('Error calling DeepSeek API:', error);
        return 'Sorry, something went wrong. We are experiencing very high traffic. Please try again later.';
    }
}

interface Message {
    from: string;
    body: string;
    reply: (response: string) => Promise<void>;
}

export async function handle_NewMessage(msg: Message): Promise<void> {
    const userNumber: string = msg.from;
    const userMessagesContext: CommunicationHistory[] = communicationhistoryList.filter(item => item.contact === userNumber);
    const commsHistoryString: string = JSON.stringify(userMessagesContext);
    const userInput: string = msg.body.trim();
    let context: string = await getContext(userInput);

    try {
        communicationhistoryList.push({ contact: userNumber, role: "user", content: userInput });
        const query: string = `chatHistory: ${commsHistoryString} question: ${userInput} context: ${context}`;

        const response: string = await getResponseFromDeepSeek(query);
        console.log('Response from DeepSeek:', response);
        communicationhistoryList.push({ contact: userNumber, role: "system", content: response });
    } catch (error: unknown) {
        console.error('Error handling message:', error);
        await msg.reply('Sorry, an error occurred. Please try again.');
    }
}

handle_NewMessage({
    from: '1234567890',
    body: 'Hello, I need help with my kamande.',
    reply: async (response: string) => console.log('Reply:', response)
}).then(() => {
    console.log('Message processed successfully.');
}).catch((error: unknown) => {
    console.error('Error processing message:', error);
});