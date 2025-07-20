import { OpenAI } from "openai"
import { getContext } from "./context"
import { systemPrompt } from "./systemPrompt"

console.log("DEEPSEEK_API_KEY:", process.env.DEEPSEEK_API_KEY?.substring(0, 7) + "...")

const DEEPSEEK_API_KEY: string | undefined = process.env.DEEPSEEK_API_KEY

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: DEEPSEEK_API_KEY,
})

console.log("OpenAI client initialized with DeepSeek API")

async function getResponseFromDeepSeek(userQuery: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery },
      ],
      model: "deepseek-chat",
      temperature: 0.7,
    })

    return completion.choices[0].message.content || "I'm here to help you find products! What are you looking for?"
  } catch (error: unknown) {
    console.error("Error calling DeepSeek API:", error)
    return JSON.stringify({
      vendaiResponse: "I'm here to help you find products! What are you looking for today?",
      productsIds: [],
    })
  }
}

export async function handle_NewMessage(
  userId: string,
  userQuery: string,
  commsHistoryString: string,
): Promise<{ vendaiResponse: string; productsIds: string[] } | null> {
  const userInput: string = userQuery.trim()

  try {
    // Get context from embedded data
    let context = ""
    try {
      context = await getContext(userInput)
      console.log("\n\nContext for user input is:", context)
    } catch (contextError) {
      console.error("Error getting context:", contextError)
      context = "No specific product context available."
    }

    // Prepare query for DeepSeek
    const query: string = `chatHistory: ${commsHistoryString} question: ${userInput} context: ${context}`

    console.log("\nBefore calling Deepseek:")
    const response: string = await getResponseFromDeepSeek(query)

    // Clean the response
    const cleanedResponse = response
      .replace(/^```json\n/, "") // Remove starting ```json
      .replace(/\n```$/, "") // Remove ending ```
      .trim()

    console.log("\nCleaned response:", cleanedResponse)

    try {
      const responseJson: { vendaiResponse: string; productsIds: string[] } = JSON.parse(cleanedResponse)
      console.log("Parsed response from DeepSeek:", responseJson)
      return responseJson
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError)
      console.log("Raw response was:", cleanedResponse)

      // Try to extract JSON from the response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const responseJson = JSON.parse(jsonMatch[0])
          console.log("Extracted JSON from response:", responseJson)
          return responseJson
        } catch (extractError) {
          console.error("Error parsing extracted JSON:", extractError)
        }
      }

      // Final fallback: return the response as text
      return {
        vendaiResponse: cleanedResponse || "I'm here to help you find products! What are you looking for?",
        productsIds: [],
      }
    }
  } catch (error: unknown) {
    console.error("Error handling message:", error)
    return {
      vendaiResponse: "I'm here to help you find products! What are you looking for today?",
      productsIds: [],
    }
  }
}
