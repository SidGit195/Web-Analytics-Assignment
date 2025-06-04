const API_BASE_URL = 'http://localhost:3000/api';

// Service Worker Installation
self.addEventListener('install', function(event) {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        Promise.resolve().then(() => {
            console.log('Service Worker: Installed successfully');
            // Skip waiting to activate immediately
            return self.skipWaiting();
        })
    );
});

// Service Worker Activation
self.addEventListener('activate', function(event) {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        Promise.resolve().then(() => {
            console.log('Service Worker: Activated successfully');
            // Claim clients immediately
            return self.clients.claim();
        })
    );
});

// Message Listener for Analytics Events
self.addEventListener('message', function(event) {
    console.log('Service Worker: Received message', event.data);
    
    if (event.data && event.data.type === 'ANALYTICS_EVENT') {
        const eventData = event.data.data;
        sendEventToBackend(eventData);
    }
});

// Function to send event to backend
async function sendEventToBackend(eventData) {
    try {
        console.log('Service Worker: Sending event to backend', eventData);
        
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Service Worker: Event sent successfully', result);
            
            // Notify the main thread of success
            notifyClients({
                type: 'EVENT_SENT_SUCCESS',
                eventData: eventData,
                result: result
            });
        } else {
            const error = await response.text();
            console.error('Service Worker: Failed to send event', response.status, error);
            
            // Notify the main thread of error
            notifyClients({
                type: 'EVENT_SENT_ERROR',
                eventData: eventData,
                error: error,
                status: response.status
            });
        }
    } catch (error) {
        console.error('Service Worker: Network error sending event', error);
        
        // Notify the main thread of network error
        notifyClients({
            type: 'EVENT_SENT_NETWORK_ERROR',
            eventData: eventData,
            error: error.message
        });
    }
}

// Function to notify all clients
function notifyClients(message) {
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage(message);
        });
    });
}

// Handle fetch events (basic implementation, no complex caching)
self.addEventListener('fetch', function(event) {
    // Let the browser handle all fetch requests normally
    // This is a minimal implementation as requested
    return;
});

console.log('Service Worker: Script loaded');