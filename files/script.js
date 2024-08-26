// List of peers to exclude
const excludedPeers = new Set(['static6', 'device1', 'kernel1', 'kernel2', 'null4', 'null6', 'rpki1']);

// Fetch and parse the peers.yml file
async function loadPeerTypes() {
    try {
        const response = await fetch('peers.yml');
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const text = await response.text();
        const lines = text.trim().split('\n');
        const peerTypes = {};

        lines.forEach(line => {
            if (line.trim() === '' || line.startsWith('#')) return; // Skip empty lines and comments

            const [peerName, type] = line.split(':').map(part => part.trim());
            if (peerName && type) {
                peerTypes[peerName] = type;
            }
        });

        return peerTypes;
    } catch (error) {
        console.error('Error loading or processing peers.yml:', error);
        return {};
    }
}

async function loadStatus(csvFile, tableId) {
    try {
        const peerTypes = await loadPeerTypes();
        const response = await fetch(csvFile);
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const text = await response.text();
        const rows = text.trim().split('\n');

        if (rows.length === 0) {
            console.error(`No data found in the CSV file: ${csvFile}`);
            return;
        }

        // Parse the header
        const headers = rows.shift().split(',').map(header => header.trim());

        if (headers.length < 8) {
            console.error('Header row has insufficient columns:', headers);
            return;
        }

        const tableBody = document.querySelector(`#${tableId} tbody`);
        
        if (!tableBody) {
            throw new Error('Table body element not found.');
        }

        tableBody.innerHTML = '';  // Clear existing rows

        rows.forEach((row, index) => {
            const columns = row.split(',').map(column => column.trim());

            // Debug output for raw row and parsed columns
            console.log(`Raw Row: ${row}`);
            console.log('Parsed Columns:', columns);

            // Check for valid number of columns
            if (columns.length < headers.length) {
                console.warn(`Row ${index + 1} has insufficient columns:`, columns);
                return;
            }

            const [peer, as, neighbor, state, inValue, outValue, since, info] = columns;
            const type = peerTypes[peer] || 'Unknown'; // Get type from peers.yml or default to 'Unknown'

            // Exclude specific peers
            if (excludedPeers.has(peer)) {
                console.log(`Skipping excluded peer: ${peer}`);
                return;
            }

            // Create a new row element
            const tr = document.createElement('tr');

            // Create and append cells
            const cells = [peer, type, as, neighbor, state, inValue || 'None', outValue || 'None', since || 'None', info || 'None'];
            cells.forEach((cellText) => {
                const td = document.createElement('td');
                td.textContent = cellText;
                tr.appendChild(td);
            });

            // Apply color coding based on info
            if (info === 'Established') {
                tr.classList.add('status-established');
            } else if (info !== 'None') {
                tr.classList.add('status-other');
            } else {
                tr.classList.add('status-none');
            }

            // Append row to table body
            tableBody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error loading or processing status data:', error);
    }
}

// Handle tab switching
function setupTabs() {
    const router1Tab = document.getElementById('router1Tab');
    const router2Tab = document.getElementById('router2Tab');
    const router1Data = document.getElementById('router1Data');
    const router2Data = document.getElementById('router2Data');

    router1Tab.addEventListener('click', () => {
        router1Tab.classList.add('active');
        router2Tab.classList.remove('active');
        router1Data.style.display = 'block';
        router2Data.style.display = 'none';
        if (router1Data.querySelector('tbody').children.length === 0) {
            loadStatus('router1.csv', 'statusTable1');
        }
    });

    router2Tab.addEventListener('click', () => {
        router2Tab.classList.add('active');
        router1Tab.classList.remove('active');
        router2Data.style.display = 'block';
        router1Data.style.display = 'none';
        if (router2Data.querySelector('tbody').children.length === 0) {
            loadStatus('router2.csv', 'statusTable2');
        }
    });

    // Load initial data for Router 1
    loadStatus('router1.csv', 'statusTable1');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', setupTabs);
