import { config } from 'dotenv';
config();

// Important: This import is needed to register the flow with Genkit.
// The AI features will not work without it.
import './flows/typing-analysis';
