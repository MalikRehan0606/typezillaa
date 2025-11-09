'use server';
/**
 * @fileOverview An AI agent for analyzing typing test performance.
 *
 * - analyzeTyping - A function that provides personalized feedback on typing speed, accuracy, and rhythm.
 * - TypingAnalysisInput - The input type for the analyzeTyping function.
 * - TypingAnalysisOutput - The return type for the analyzeTyping function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const TypingAnalysisInputSchema = z.object({
  wpm: z.number().describe('The user\'s words per minute.'),
  accuracy: z.number().describe('The user\'s accuracy percentage.'),
  consistency: z.number().describe('The user\'s typing rhythm consistency percentage.'),
  textToType: z.string().describe('The original text the user was supposed to type.'),
  userInput: z.string().describe('The actual text the user typed.'),
});
export type TypingAnalysisInput = z.infer<typeof TypingAnalysisInputSchema>;

const TypingAnalysisOutputSchema = z.object({
  positiveFeedback: z.string().describe('A brief, encouraging comment about what the user did well.'),
  mainAreaForImprovement: z.string().describe('The single most important area for the user to focus on (e.g., Accuracy, Speed, Rhythm).'),
  improvementTip: z.string().describe('A specific, actionable tip to help the user improve in their main area of weakness.'),
  practiceSuggestion: z.string().describe('A short sentence suggesting a specific type of practice, like focusing on commonly misspelled words.'),
});
export type TypingAnalysisOutput = z.infer<typeof TypingAnalysisOutputSchema>;

export async function analyzeTyping(input: TypingAnalysisInput): Promise<TypingAnalysisOutput> {
  return await typingAnalysisFlow(input);
}

const typingAnalysisPrompt = ai.definePrompt({
  name: 'typingAnalysisPrompt',
  input: {schema: TypingAnalysisInputSchema},
  output: {schema: TypingAnalysisOutputSchema},
  prompt: `You are an expert typing coach. Your goal is to provide encouraging and actionable feedback to a user based on their typing test results. Analyze the provided metrics and text to identify one key strength and one primary area for improvement.

User's Performance:
- Words Per Minute (WPM): {{wpm}}
- Accuracy: {{accuracy}}%
- Rhythm Consistency: {{consistency}}%

Original Text:
---
{{textToType}}
---

User's Typed Text:
---
{{userInput}}
---

Your Task:
1.  **Positive Feedback:** Start with a brief, positive, and encouraging statement. Find something the user did well, even if their overall score is low.
2.  **Main Area for Improvement:** Identify the single most critical area for improvement. This could be accuracy (if they made many mistakes), speed (if they were accurate but slow), or rhythm/consistency (if their speed was erratic).
3.  **Improvement Tip:** Provide one clear, actionable tip to help them address this weakness.
4.  **Practice Suggestion:** Give a short, concrete suggestion for what they can practice next. If they made specific typos, you can mention practicing those words.

Keep your feedback concise, friendly, and highly encouraging. Focus on helping the user improve, not just listing their faults.`,
});

const typingAnalysisFlow = ai.defineFlow(
  {
    name: 'typingAnalysisFlow',
    inputSchema: TypingAnalysisInputSchema,
    outputSchema: TypingAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await typingAnalysisPrompt(input);
    if (!output) {
      throw new Error('The AI model did not return an analysis.');
    }
    return output;
  }
);
