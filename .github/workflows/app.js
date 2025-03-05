document.addEventListener('DOMContentLoaded', () => {
    // API URLs
    const getEntriesUrl = '/api/GetEntries';
    const addEntryUrl = '/api/AddEntry';
    
    const entriesContainer = document.getElementById('entriesContainer');
    const entryForm = document.getElementById('entryForm');
    
    // Fetch all entries when the page loads
    fetchEntries();
    
    // Add event listener for form submission
    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const messageInput = document.getElementById('message');
        
        // Create entry data
        const entryData = {
            name: nameInput.value.trim(),
            message: messageInput.value.trim()
        };
        
        try {
            // Display loading state
            const submitButton = entryForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
            
            // Send POST request to add entry
            const response = await fetch(addEntryUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(entryData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add entry');
            }
            
            // Reset form
            nameInput.value = '';
            messageInput.value = '';
            
            // Refresh entries
            fetchEntries();
            
            // Reset button
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            
        } catch (error) {
            console.error('Error adding entry:', error);
            alert(`Error adding entry: ${error.message}`);
            
            // Reset button
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
    
    // Function to fetch all entries
    async function fetchEntries() {
        try {
            // Show loading indicator
            entriesContainer.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;
            
            // Fetch entries from API
            const response = await fetch(getEntriesUrl);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch entries');
            }
            
            const entries = await response.json();
            
            // Display entries
            if (entries && entries.length > 0) {
                entriesContainer.innerHTML = entries.map(entry => `
                    <div class="entry">
                        <div class="entry-header">
                            <span class="entry-name">${escapeHtml(entry.name)}</span>
                            <span class="entry-timestamp">${formatTimestamp(entry.timestamp)}</span>
                        </div>
                        <div class="entry-message">${escapeHtml(entry.message)}</div>
                    </div>
                `).join('');
            } else {
                entriesContainer.innerHTML = '<p class="text-center">No entries yet. Be the first to leave a message!</p>';
            }
            
        } catch (error) {
            console.error('Error fetching entries:', error);
            entriesContainer.innerHTML = `<p class="text-danger">Error loading entries: ${error.message}</p>`;
        }
    }
    
    // Helper function to format timestamp
    function formatTimestamp(timestamp) {
        try {
            const date = new Date(timestamp);
            return date.toLocaleString();
        } catch (e) {
            return timestamp;
        }
    }
    
    // Helper function to escape HTML
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
