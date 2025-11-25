// Map management
class MapManager {
    static initMap() {
        // Initialize main map
        if (!this.map) {
            this.map = L.map('map').setView([-19.9167, -43.9345], 10); // Default to Belo Horizonte
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);
            
            this.addFireMarkers();
            
            // Add event listeners for map page buttons
            document.getElementById('my-location-btn').addEventListener('click', () => this.centerOnUserLocation());
            document.getElementById('filter-btn').addEventListener('click', () => this.showFilters());
            
            // Add click event to incident cards
            document.querySelectorAll('.incident-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    const reportId = e.currentTarget.getAttribute('data-id');
                    this.focusOnReport(reportId);
                });
            });
        }
    }
    
    static initHomeMap() {
        // Initialize home page map
        if (!this.homeMap) {
            this.homeMap = L.map('home-map').setView([-19.9167, -43.9345], 10);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.homeMap);
            
            this.addFireMarkers(this.homeMap);
        }
    }
    
    static addFireMarkers(map = this.map) {
        const reports = StorageManager.getReports();
        
        reports.forEach(report => {
            let iconColor;
            switch (report.status) {
                case 'active':
                    iconColor = 'red';
                    break;
                case 'pending':
                    iconColor = 'orange';
                    break;
                case 'resolved':
                    iconColor = 'green';
                    break;
                default:
                    iconColor = 'gray';
            }
            
            const fireIcon = L.divIcon({
                className: 'fire-marker',
                html: `<i class="bi bi-fire" style="color: ${iconColor}; font-size: 24px;"></i>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            
            const marker = L.marker([
                report.coordinates.lat + (Math.random() - 0.5) * 0.1,
                report.coordinates.lng + (Math.random() - 0.5) * 0.1
            ], { icon: fireIcon }).addTo(map);
            
            marker.bindPopup(`
                <div class="fire-marker-popup">
                    <h3>${report.location}</h3>
                    <p class="status">Status: <strong>${report.status === 'active' ? 'Em Atendimento' : report.status === 'pending' ? 'Em Análise' : 'Resolvido'}</strong></p>
                    <p>${report.description}</p>
                    <p class="date">Reportado em: ${new Date(report.date).toLocaleString()}</p>
                    ${report.urgent ? '<p><strong>⚠️ URGENTE</strong></p>' : ''}
                </div>
            `);
        });
    }
    
    static centerOnUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    this.map.setView([lat, lng], 13);
                    
                    // Add user location marker
                    if (this.userLocationMarker) {
                        this.map.removeLayer(this.userLocationMarker);
                    }
                    
                    this.userLocationMarker = L.marker([lat, lng])
                        .addTo(this.map)
                        .bindPopup('Sua localização atual')
                        .openPopup();
                },
                (error) => {
                    alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
                }
            );
        } else {
            alert('Geolocalização não é suportada pelo seu navegador.');
        }
    }
    
    static showFilters() {
        alert('Filtros de visualização seriam exibidos aqui.');
    }
    
    static focusOnReport(reportId) {
        const report = StorageManager.getReports().find(r => r.id === reportId);
        if (report && this.map) {
            this.map.setView([report.coordinates.lat, report.coordinates.lng], 13);
            
            // Open popup for this report
            setTimeout(() => {
                this.map.eachLayer(layer => {
                    if (layer instanceof L.Marker && layer.getLatLng().lat === report.coordinates.lat) {
                        layer.openPopup();
                    }
                });
            }, 500);
        }
    }
}