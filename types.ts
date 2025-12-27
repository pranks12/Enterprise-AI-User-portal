
export enum AgentStatus {
  SUBMITTED = 'SUBMITTED',
  PENDING_GOVERNANCE = 'PENDING_GOVERNANCE',
  PENDING_SECURITY = 'PENDING_SECURITY',
  APPROVED = 'APPROVED',
  APPROVED_WITH_CONDITIONS = 'APPROVED_WITH_CONDITIONS',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  EXPIRING_SOON = 'EXPIRING_SOON',
  EXPIRED = 'EXPIRED'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Agent {
  id: string;
  name: string;
  useCase: string;
  description: string;
  department: string;
  owner: string;
  status: AgentStatus;
  riskLevel: RiskLevel;
  tags: string[];
  usageCount: number;
  lastUpdated: string;
  permissions: string[];
  dataAccess: string[];
  systems: string[];
  externalAPIs: boolean;
}

export interface EnhancementRequest {
  id: string;
  agentId: string;
  requester: string;
  description: string;
  businessValue: string;
  upvotes: number;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Declined';
}
