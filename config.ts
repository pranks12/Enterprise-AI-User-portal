
/**
 * Multi-Portal Architecture Configuration
 */

// Updated to verified credentials provided by user
const DEFAULT_KEY = 'usr-key-2024-USER-def456';
const DEFAULT_ID = 'user-portal';

export const PORTAL_CONFIG = {
  governanceApiUrl: 'https://delmgovernance.vsarangapany.com',
  governanceEndpoint: '/api/portal/request',
  statusEndpoint: '/api/approvals/',
  
  /**
   * Strictly generates only the required headers.
   * Ensures NO Content-Type or body headers are sent on GET requests to avoid 403 Forbidden.
   */
  getHeaders: (isPost: boolean = false) => {
    const headers: Record<string, string> = {
      'X-Portal-Key': DEFAULT_KEY,
      'X-Portal-Id': DEFAULT_ID
    };

    if (isPost) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  },

  securityApiUrl: 'https://securityportal.vsarangapany.com',
  userPortalUrl: 'https://userportal.vsarangapany.com',
};
