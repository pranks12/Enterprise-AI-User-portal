
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_INTAKE, SYSTEM_INSTRUCTION_DISCOVERY, SYSTEM_INSTRUCTION_ENHANCEMENT, MOCK_AGENTS } from '../constants';
import { PORTAL_CONFIG } from '../config';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

const validateInputContext = (input: string): boolean => {
  const forbidden = ['ignore all previous', 'system prompt', 'developer mode', 'bypass', 'jailbreak'];
  const lowercaseInput = input.toLowerCase();
  return !forbidden.some(word => lowercaseInput.includes(word));
};

/**
 * PRODUCTION NOTE: 
 * In a real environment, this function would wrap a fetch() call to PORTAL_CONFIG.governanceApiUrl
 */
export const submitToGovernancePortal = async (payload: any) => {
  console.log(`POSTing to ${PORTAL_CONFIG.governanceApiUrl}/api/requests`, payload);
  // For demo/production readiness, we simulate the network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        requestId: `REQ-${Math.floor(Math.random() * 100000)}`,
        status: 'PENDING_GOVERNANCE',
        riskScore: 5,
        riskLevel: 'MEDIUM'
      });
    }, 1500);
  });
};

export const analyzeIntakeRequest = async (name: string, description: string, useCase: string) => {
  if (!validateInputContext(name + description + useCase)) {
    return { safetyTriggered: true, analysis: "Security Guardrail: Potential prompt injection detected." };
  }

  try {
    const catalogContext = JSON.stringify(MOCK_AGENTS.map(a => ({ name: a.name, useCase: a.useCase, description: a.description })));
    const prompt = `Catalog: ${catalogContext}\nProposed: ${name}, ${useCase}, ${description}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_INTAKE,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isDuplicate: { type: Type.BOOLEAN },
            duplicateReason: { type: Type.STRING },
            refinedDescription: { type: Type.STRING },
            suggestedUseCase: { type: Type.STRING },
            analysis: { type: Type.STRING },
            safetyTriggered: { type: Type.BOOLEAN }
          },
          required: ["safetyTriggered", "analysis"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { safetyTriggered: true, analysis: "System unable to process safely." };
  }
};

export const searchAgentCatalog = async (query: string) => {
  if (!validateInputContext(query)) return { safetyTriggered: true, reasoning: "Input rejected." };
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Query: ${query} Catalog: ${JSON.stringify(MOCK_AGENTS)}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_DISCOVERY,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedAgentIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            reasoning: { type: Type.STRING },
            safetyTriggered: { type: Type.BOOLEAN }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) { return null; }
};

export const analyzeEnhancement = async (agentName: string, feedback: string) => {
  if (!validateInputContext(feedback)) return { safetyTriggered: true };
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Agent: ${agentName} Feedback: ${feedback}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_ENHANCEMENT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            businessValue: { type: Type.STRING },
            impactAnalysis: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['Feature', 'Bug', 'Security', 'Performance'] },
            safetyTriggered: { type: Type.BOOLEAN }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) { return null; }
};

export const runPlaygroundTest = async (type: any, instruction: string, prompt: string) => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: { systemInstruction: instruction, responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '{}');
};
