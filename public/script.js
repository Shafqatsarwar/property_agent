// Public/script.js
// Frontend JavaScript for Property Real Estate Agent UI

class PropertyAgentUI {
    constructor() {
        this.apiBaseUrl = '/api'; // Assuming the backend runs on the same server
        this.chatHistory = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Allow Enter key to submit (with Shift for new line)
        const queryInput = document.getElementById('user-query');
        if (queryInput) {
            queryInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.submitQuery();
                }
            });
        }
    }

    loadPrompt(prompt) {
        document.getElementById('user-query').value = prompt;
    }

    async submitQuery() {
        const query = document.getElementById('user-query').value.trim();
        const mode = document.getElementById('agent-mode').value;

        if (!query) {
            this.displayMessage('Please enter a query.', 'error');
            return;
        }

        // Disable submit button and show loading
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            // Display user message
            this.displayMessage(query, 'user');

            // Prepare request based on mode
            let response;
            if (mode === 'ai') {
                // Use AI assistant endpoint
                response = await this.callAIAssistant(query);
            } else if (mode === 'standalone') {
                // Use agent query endpoint
                response = await this.callAgentQuery(query);
            } else {
                // Auto mode - try AI first, fall back to standalone
                response = await this.callAutoMode(query);
            }

            // Display agent response
            if (response.success) {
                this.displayMessage(response.response || response.message, 'agent');

                // Store in chat history
                this.chatHistory.push({
                    query: query,
                    response: response,
                    timestamp: new Date().toISOString()
                });
            } else {
                this.displayMessage('Error: ' + (response.error || 'Unknown error occurred'), 'error');
            }
        } catch (error) {
            console.error('Error submitting query:', error);
            this.displayMessage('Error: ' + error.message, 'error');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Query';

            // Clear input
            document.getElementById('user-query').value = '';
        }
    }

    async callAIAssistant(query) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: query,
                    context: { type: 'user-query', source: 'web-ui' }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn('AI Assistant error, falling back to agent query:', error);
            // Fallback to agent query
            return await this.callAgentQuery(query);
        }
    }

    async callAgentQuery(query) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/ui/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Agent query error:', error);
            throw error;
        }
    }

    async callAutoMode(query) {
        try {
            // First try AI assistant
            try {
                const aiResponse = await this.callAIAssistant(query);
                if (aiResponse && aiResponse.response) {
                    return aiResponse;
                }
            } catch (aiError) {
                console.warn('AI service unavailable, using standalone agent:', aiError.message);
            }

            // If AI fails or doesn't have a good response, use standalone
            return await this.callAgentQuery(query);
        } catch (error) {
            console.error('Auto mode error:', error);
            throw error;
        }
    }

    displayMessage(content, type) {
        const container = document.getElementById('response-container');

        // Remove welcome message if it exists
        const welcomeMsg = container.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }

        let messageElement;

        if (type === 'user') {
            messageElement = document.createElement('div');
            messageElement.className = 'user-message';
            messageElement.textContent = content;
        } else if (type === 'agent') {
            messageElement = document.createElement('div');
            messageElement.className = 'agent-response';

            const header = document.createElement('div');
            header.className = 'response-header';
            header.textContent = 'PropertyParams Agent:';
            messageElement.appendChild(header);

            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = this.formatResponse(content);
            messageElement.appendChild(contentDiv);
        } else if (type === 'error') {
            messageElement = document.createElement('div');
            messageElement.className = 'error';
            messageElement.textContent = content;
        } else if (type === 'success') {
            messageElement = document.createElement('div');
            messageElement.className = 'success';
            messageElement.textContent = content;
        }

        container.appendChild(messageElement);

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    formatResponse(response) {
        // Format the response for display
        if (typeof response === 'string') {
            // Convert newlines to <br> tags
            return response.replace(/\n/g, '<br>');
        } else if (typeof response === 'object') {
            // Pretty print objects
            try {
                return '<pre>' + JSON.stringify(response, null, 2) + '</pre>';
            } catch (e) {
                return String(response);
            }
        }
        return String(response);
    }

    clearChat() {
        const container = document.getElementById('response-container');
        container.innerHTML = '<div class="welcome-message"><h3>Welcome to the Property Real Estate Agent!</h3><p>I can help you with property searches, agent recommendations, market analysis, and more.</p><p>Select a pre-built prompt or type your own query above.</p></div>';
        this.chatHistory = [];
    }

    // Additional utility methods
    getChatHistory() {
        return [...this.chatHistory];
    }

    downloadChatHistory() {
        const dataStr = JSON.stringify(this.chatHistory, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = `property-agent-chat-${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
}

// Global functions for HTML onclick attributes
let agentUI;

document.addEventListener('DOMContentLoaded', function() {
    agentUI = new PropertyAgentUI();
});

function loadPrompt(prompt) {
    if (agentUI) {
        agentUI.loadPrompt(prompt);
    }
}

function submitQuery() {
    if (agentUI) {
        agentUI.submitQuery();
    }
}

function clearChat() {
    if (agentUI) {
        agentUI.clearChat();
    }
}

// Expose global functions for the HTML
window.loadPrompt = loadPrompt;
window.submitQuery = submitQuery;
window.clearChat = clearChat;

// Add some example functionality for demonstration
console.log('Property Real Estate Agent UI loaded successfully!');