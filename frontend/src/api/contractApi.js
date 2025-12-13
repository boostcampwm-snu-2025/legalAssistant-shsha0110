const BASE_URL = 'http://localhost:3000';

/**
 * Helper function to handle fetch requests cleanly.
 * Wraps the boilerplate code (headers, JSON stringify, error handling).
 */
const postRequest = async (endpoint, data) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Required for sending JSON
            },
            body: JSON.stringify(data), // Fetch requires manual stringification
        });

        // Fetch does not throw an error on 4xx/5xx status, so we check manually.
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        // Parse JSON response
        return await response.json();
        
    } catch (error) {
        console.error('API Request Failed:', error);
        throw error; // Re-throw to be handled by the component
    }
};

/**
 * Request AI Legal Review
 * Sends the contract state to the backend.
 */
export const reviewContract = async (contractData) => {
  // Uses the helper function above
  return await postRequest('/api/review', { contractData });
};

/**
 * Send a question to AI Chat
 * Sends the message and context to the backend.
 */
export const sendChat = async (message, contextData) => {
    return await postRequest('/api/chat', { 
        message, 
        context: contextData 
    });
};

/**
 * Classify Job Description
 * Calls the backend to determine if the job is 'Simple Labor'.
 * @param {string} jobDescription 
 * @returns {Promise<object>} { isSimpleLabor, categoryName, reason }
 */
export const classifyJob = async (jobDescription) => {
    return await postRequest('/api/classify-job', { jobDescription });
};