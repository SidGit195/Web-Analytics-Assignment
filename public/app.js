let serviceWorker = null;
let userId = 'user_' + Math.random().toString(36).substr(2, 9);

function updateSWStatus(message, type) {
    const statusEl = document.getElementById('sw-status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    console.log('SW Status:', message);
}

// Service Worker Registration
document.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator) {
        updateSWStatus('Service Worker: Starting registration…', 'info');
        navigator.serviceWorker
            .register('service-worker.js')
            .then(reg => {
                console.log('SW registered:', reg);
                updateSWStatus('Service Worker: Registered ✅', 'success');
                return navigator.serviceWorker.ready;
            })
            .then(() => {
                console.log('SW ready');
                updateSWStatus('Service Worker: Active and Ready ✅', 'success');
                initializeApp();
            })
            .catch(err => {
                console.error('SW registration failed:', err);
                updateSWStatus(`Service Worker: Failed ❌ ${err.message}`, 'error');
                showFallbackMode();
            });
    } else {
        updateSWStatus('Service Worker: Not supported ❌', 'error');
        showFallbackMode();
    }
});

function initializeApp() {
    console.log('Initializing app with Service Worker');
    sendViewEvent();
    loadAnalytics();
}

function showFallbackMode() {
    console.log('Running in fallback mode');
    updateSWStatus('Running in fallback mode (direct API calls) 🔄', 'info');
    sendViewEventDirect();
    loadAnalytics();
}

function sendEventDirect(eventData) {
    console.log('Sending event directly:', eventData);
    fetch('/api/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Event sent directly - success:', data);
    })
    .catch(error => {
        console.error('Error sending event directly:', error);
    });
}

function sendViewEventDirect() {
    const eventData = {
        user_id: userId,
        event_type: 'view',
        payload: {
            url: window.location.href,
            title: document.title
        }
    };
    
    sendEventDirect(eventData);
    console.log('View event sent directly:', eventData);
}

function sendClickEventDirect(elementId, text) {
    const eventData = {
        user_id: userId,
        event_type: 'click',
        payload: {
            element_id: elementId,
            text: text,
            xpath: `//*[@id="${elementId}"]`
        }
    };
    
    sendEventDirect(eventData);
    console.log('Click event sent directly:', eventData);
}

function sendLocationEventDirect(latitude, longitude, accuracy) {
    const eventData = {
        user_id: userId,
        event_type: 'location',
        payload: {
            latitude: latitude,
            longitude: longitude,
            accuracy: accuracy
        }
    };
    
    sendEventDirect(eventData);
    console.log('Location event sent directly:', eventData);
}

function sendEventToServiceWorker(eventData) {
    if (navigator.serviceWorker.controller) {
        console.log('Sending via Service Worker:', eventData);
        navigator.serviceWorker.controller.postMessage({
            type: 'ANALYTICS_EVENT',
            data: eventData
        });
    } else {
        console.log('No SW controller, falling back to direct:', eventData);
        sendEventDirect(eventData);
    }
}

function sendViewEvent() {
    const eventData = {
        user_id: userId,
        event_type: 'view',
        payload: {
            url: window.location.href,
            title: document.title
        }
    };
    
    if (navigator.serviceWorker.controller) {
        sendEventToServiceWorker(eventData);
        console.log('View event sent via SW:', eventData);
    } else {
        sendViewEventDirect();
    }
}

function sendClickEvent(elementId, text) {
    const eventData = {
        user_id: userId,
        event_type: 'click',
        payload: {
            element_id: elementId,
            text: text,
            xpath: `//*[@id="${elementId}"]`
        }
    };
    
    if (navigator.serviceWorker.controller) {
        sendEventToServiceWorker(eventData);
        console.log('Click event sent via SW:', eventData);
    } else {
        sendClickEventDirect(elementId, text);
    }
}

function sendLocationEvent(latitude, longitude, accuracy) {
    const eventData = {
        user_id: userId,
        event_type: 'location',
        payload: {
            latitude: latitude,
            longitude: longitude,
            accuracy: accuracy
        }
    };
    
    if (navigator.serviceWorker.controller) {
        sendEventToServiceWorker(eventData);
        console.log('Location event sent via SW:', eventData);
    } else {
        sendLocationEventDirect(latitude, longitude, accuracy);
    }
}

async function loadAnalytics() {
    try {
        console.log('Loading analytics...');
        
        const totalResponse = await fetch('/api/analytics/event-counts');
        if (!totalResponse.ok) {
            throw new Error(`HTTP error! status: ${totalResponse.status}`);
        }
        const totalData = await totalResponse.json();
        document.getElementById('total-events').textContent = JSON.stringify(totalData, null, 2);
        
        const typeResponse = await fetch('/api/analytics/event-counts-by-type');
        if (!typeResponse.ok) {
            throw new Error(`HTTP error! status: ${typeResponse.status}`);
        }
        const typeData = await typeResponse.json();
        document.getElementById('events-by-type').textContent = JSON.stringify(typeData, null, 2);
        
        console.log('Analytics loaded successfully');
    } catch (error) {
        console.error('Error loading analytics:', error);
        document.getElementById('total-events').textContent = 'Error loading data: ' + error.message;
        document.getElementById('events-by-type').textContent = 'Error loading data: ' + error.message;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    document.getElementById('manual-view').addEventListener('click', function() {
        sendViewEvent();
        this.textContent = 'View Event Sent! ✅';
        setTimeout(() => {
            this.textContent = 'Send Manual View Event';
        }, 2000);
    });
    
    document.getElementById('click-me').addEventListener('click', function() {
        sendClickEvent('click-me', 'Click Me!');
        this.textContent = 'Click Event Sent! ✅';
        setTimeout(() => {
            this.textContent = 'Click Me!';
        }, 2000);
    });
    
    document.getElementById('get-location').addEventListener('click', function() {
        const button = this;
        const statusDiv = document.getElementById('location-status');
        
        button.disabled = true;
        button.textContent = 'Getting Location...';
        statusDiv.innerHTML = '<div class="status info">Requesting location permission...</div>';
        
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const accuracy = position.coords.accuracy;
                    
                    sendLocationEvent(lat, lng, accuracy);
                    
                    button.disabled = false;
                    button.textContent = 'Location Event Sent! ✅';
                    statusDiv.innerHTML = `
                        <div class="status success">
                            Location captured: ${lat.toFixed(4)}, ${lng.toFixed(4)} 
                            (±${Math.round(accuracy)}m)
                        </div>
                    `;
                    
                    setTimeout(() => {
                        button.textContent = 'Get My Location';
                        statusDiv.innerHTML = '';
                    }, 5000);
                },
                function(error) {
                    button.disabled = false;
                    button.textContent = 'Get My Location';
                    
                    let errorMessage = 'Location access denied or unavailable';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                    }
                    
                    statusDiv.innerHTML = `<div class="status error">${errorMessage}</div>`;
                    console.error('Geolocation error:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        } else {
            button.disabled = false;
            button.textContent = 'Get My Location';
            statusDiv.innerHTML = '<div class="status error">Geolocation not supported</div>';
        }
    });
    
    document.getElementById('refresh-analytics').addEventListener('click', function() {
        this.textContent = 'Refreshing...';
        loadAnalytics().then(() => {
            this.textContent = 'Analytics Refreshed! ✅';
            setTimeout(() => {
                this.textContent = 'Refresh Analytics';
            }, 2000);
        });
    });
});