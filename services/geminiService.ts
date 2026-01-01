
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
 * Normalizes status strings from Governance Portal.
 */
const normalizeStatus = (rawStatus: string): string => {
  if (!rawStatus) return 'PENDING';
  const s = rawStatus.toLowerCase().trim();
  if (s === 'approved') return 'APPROVED';
  if (s === 'rejected') return 'REJECTED';
  return 'PENDING';
};

/**
 * Fetches status from GET API as suggested by verified snippet.
 * Path: /api/approvals/{id}
 */
export const getApprovalStatus = async (approvalId: string) => {
  try {
    const response = await fetch(`${PORTAL_CONFIG.governanceApiUrl}/api/approvals/${approvalId}`, {
      method: 'GET',
      headers: {
        'X-Portal-Key': 'usr-key-2024-USER-def456',
        'X-Portal-Id': 'user-portal'
      }
    });

    if (!response.ok) {
      throw new Error(`Governance fetch failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Strict mapping to the structure provided: data.approval
    // Added approvedBy, rejectedBy, approvedAt, rejectedAt to satisfy Dashboard.tsx requirements
    if (data && data.approval) {
      return {
        status: normalizeStatus(data.approval.status),
        rejectionReason: data.approval.rejectionReason || data.approval.message || null,
        message: data.approval.rejectionReason || data.approval.message || null,
        admin: data.approval.rejectedBy || data.approval.approvedBy || null,
        approvedBy: data.approval.approvedBy || null,
        rejectedBy: data.approval.rejectedBy || null,
        approvedAt: data.approval.approvedAt || null,
        rejectedAt: data.approval.rejectedAt || null,
        id: approvalId
      };
    }
    
    return null;
  } catch (error) {
    console.error("[Governance API] GET Error:", error);
    throw error;
  }
};

/**
 * Sends a New Agent deployment request to the Governance Portal.
 */
export const submitToGovernancePortal = async (formData: any, aiAnalysis: any) => {
  const payload = {
    action: "deploy",
    agentId: `agt_${Date.now()}`,
    agentName: formData.agentName,
    purpose: formData.purpose,
    requestedBy: formData.requestorEmail,
    department: formData.requestorDept,
    description: formData.description,
    aiAnalysis: aiAnalysis.analysis
  };

  try {
    const response = await fetch(`${PORTAL_CONFIG.governanceApiUrl}${PORTAL_CONFIG.governanceEndpoint}`, {
      method: 'POST',
      headers: {
        'X-Portal-Key': 'usr-key-2024-USER-def456',
        'X-Portal-Id': 'user-portal',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[Governance API] POST Error:", error);
    throw error;
  }
};

/**
 * Sends an Enhancement request to the Governance Portal.
 */
export const submitEnhancementToGovernancePortal = async (
  agentName: string, 
  requesterEmail: string, 
  dept: string, 
  feedback: string, 
  aiAnalysis: any
) => {
  const payload = {
    action: "enhance",
    agentId: agentName.toLowerCase().replace(/\s+/g, '_'),
    agentName: agentName,
    purpose: `ENHANCEMENT: ${feedback}`,
    requestedBy: requesterEmail,
    department: dept
  };

  try {
    const response = await fetch(`${PORTAL_CONFIG.governanceApiUrl}${PORTAL_CONFIG.governanceEndpoint}`, {
      method: 'POST',
      headers: {
        'X-Portal-Key': 'usr-key-2024-USER-def456',
        'X-Portal-Id': 'user-portal',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Governance API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Enhancement submission failed:", error);
    throw error;
  }
};

export const analyzeIntakeRequest = async (name: string, description: string, purpose: string) => {
  if (!validateInputContext(name + description + purpose)) {
    return { safetyTriggered: true, analysis: "Security Guardrail: Potential prompt injection detected." };
  }

  try {
    const catalogContext = JSON.stringify(MOCK_AGENTS.map(a => ({ name: a.name, description: a.description })));
    const prompt = `Catalog: ${catalogContext}\nProposed Name: ${name}\nPurpose: ${purpose}\nDetails: ${description}`;

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
