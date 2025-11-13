import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

const TEMPLATE = `You are a helpful assistant that analyzes GitHub repositories.
Please analyze the following README content and provide a summary and interesting facts about the repository.

README Content:
{readme_content}

Provide a concise summary of the repository and list two cool/interesting facts about it.`;

const prompt = ChatPromptTemplate.fromTemplate(TEMPLATE);

// Define schema using Zod
const repoAnalysisSchema = z.object({
  summary: z.string().describe('A concise summary of what the repository is about'),
  cool_facts: z.array(z.string()).describe('List of interesting facts about the repository'),
});

export async function analyzeReadme(readmeContent) {
  try {
    const model = new ChatOpenAI({
      modelName: 'gpt-4.1-nano',
      temperature: 0.0,
    });

    // Use withStructuredOutput for strict schema enforcement
    const structuredModel = model.withStructuredOutput(repoAnalysisSchema);

    const chain = prompt.pipe(structuredModel);

    const response = await chain.invoke({
      readme_content: readmeContent,
    });

    return response;
  } catch (error) {
    console.error('Error analyzing README:', error);
    throw new Error('Failed to analyze repository');
  }
}
