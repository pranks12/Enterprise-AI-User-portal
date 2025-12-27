
/**
 * Multi-Portal Architecture Configuration
 * These URLs point to the other portals in your ecosystem.
 * In production, these should be updated via environment variables in Cloudflare.
 */

export const PORTAL_CONFIG = {
  // The Governance Portal (Node.js/LangGraph)
  governanceApiUrl: process.env.VITE_GOVERNANCE_API_URL || 'http://localhost:3000',
  
  // The Security Portal (Python/Django)
  securityApiUrl: process.env.VITE_SECURITY_API_URL || 'http://localhost:3002',

  // Current User Portal Public URL (for Webhooks)
  userPortalUrl: process.env.VITE_USER_PORTAL_URL || 'http://localhost:3001',
};
