import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

//REVIEW better prompt using least amount of tokens
const promptFinancialOverview = `As a CFO, draft a concise, structured board review with sections: Performance, Profitability, Liquidity, Efficiency, Strategic Position, and SWOT. Use lists for clarity.`;

export async function getLLMOverview(companyData) {
    try {
        const response = await client.responses.create({
            model: "gpt-4.1-nano-2025-04-14",
            input: `${promptFinancialOverview} ${JSON.stringify(companyData)}`,
        });
        console.log('LLM response:', response);
        return response.output_text;
    } catch (error) {
        console.error('Error communicating with LLM:', error);
        throw new Error('Failed to get LLM overview.');
    }
}