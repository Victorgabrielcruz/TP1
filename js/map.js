// Map management
class MapManager {
    static initMap() {
        // Só inicializar se o elemento map existir
        const mapElement = document.getElementById('map');
        if (!mapElement) return;
        
        // Clean up previous map instance if exists
        if (this.map) {
            this.map.remove();
            this.map = null;
        }

        // Initialize main map
        this.map = L.map('map').setView([-19.9167, -43.9345], 10);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        
        this.addFireMarkers();
        
        // Usar event delegation para os botões que podem ser recriados
        document.addEventListener('click', (e) => {
            if (e.target.id === 'my-location-btn' || e.target.closest('#my-location-btn')) {
                this.centerOnUserLocation();
            }
            if (e.target.id === 'filter-btn' || e.target.closest('#filter-btn')) {
                this.showFilters();
            }
        });
        
        // Add click event to incident cards usando event delegation
        document.addEventListener('click', (e) => {
            const incidentCard = e.target.closest('.incident-card');
            if (incidentCard) {
                const reportId = incidentCard.getAttribute('data-id');
                this.focusOnReport(reportId);
            }
        });
        
        // Trigger resize para garantir que o mapa se redimensiona corretamente
        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);
    }
    
    static initHomeMap() {
        // Só inicializar se o elemento home-map existir
        const homeMapElement = document.getElementById('home-map');
        if (!homeMapElement) return;
        
        // Clean up previous home map instance if exists
        if (this.homeMap) {
            this.homeMap.remove();
            this.homeMap = null;
        }

        // Initialize home page map
        this.homeMap = L.map('home-map').setView([-19.9167, -43.9345], 10);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.homeMap);
        
        this.addFireMarkers(this.homeMap);
        
        // Trigger resize para garantir que o mapa se redimensiona corretamente
        setTimeout(() => {
            this.homeMap.invalidateSize();
        }, 100);
    }
    
    static addFireMarkers(map = this.map) {
        // Verificar se o mapa existe
        if (!map) return;
        
        const reports = StorageManager.getReports();
        
        // Limpar marcadores existentes
        if (map.fireMarkers) {
            map.fireMarkers.forEach(marker => map.removeLayer(marker));
        }
        
        map.fireMarkers = [];
        
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
            
            map.fireMarkers.push(marker);
        });
    }
    
    static centerOnUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    if (this.map) {
                        this.map.setView([lat, lng], 13);
                        
                        // Add user location marker
                        if (this.userLocationMarker) {
                            this.map.removeLayer(this.userLocationMarker);
                        }
                        
                        this.userLocationMarker = L.marker([lat, lng])
                            .addTo(this.map)
                            .bindPopup('Sua localização atual')
                            .openPopup();
                    }
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
        // Criar um modal simples de filtros
        const filterHTML = `
            <div class="modal fade" id="filterModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Filtros do Mapa</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Status dos Focos:</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="filter-active" checked>
                                    <label class="form-check-label" for="filter-active">
                                        Focos Ativos
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="filter-pending" checked>
                                    <label class="form-check-label" for="filter-pending">
                                        Em Análise
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="filter-resolved">
                                    <label class="form-check-label" for="filter-resolved">
                                        Resolvidos
                                    </label>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="filter-date" class="form-label">Data:</label>
                                <select class="form-select" id="filter-date">
                                    <option value="all">Todos os períodos</option>
                                    <option value="today">Hoje</option>
                                    <option value="week">Esta semana</option>
                                    <option value="month">Este mês</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="apply-filters">Aplicar Filtros</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar o modal ao DOM se não existir
        if (!document.getElementById('filterModal')) {
            document.body.insertAdjacentHTML('beforeend', filterHTML);
        }
        
        const filterModal = new bootstrap.Modal(document.getElementById('filterModal'));
        filterModal.show();
        
        // Configurar o botão de aplicar filtros
        document.getElementById('apply-filters').onclick = () => {
            filterModal.hide();
            alert('Filtros aplicados! (Funcionalidade de filtro seria implementada aqui)');
        };
    }
    
    static focusOnReport(reportId) {
        const report = StorageManager.getReports().find(r => r.id === reportId);
        if (report && this.map) {
            this.map.setView([report.coordinates.lat, report.coordinates.lng], 13);
            
            // Tentar abrir o popup para este relatório
            setTimeout(() => {
                if (this.map && this.map.fireMarkers) {
                    this.map.fireMarkers.forEach(marker => {
                        const markerLatLng = marker.getLatLng();
                        if (Math.abs(markerLatLng.lat - report.coordinates.lat) < 0.01 && 
                            Math.abs(markerLatLng.lng - report.coordinates.lng) < 0.01) {
                            marker.openPopup();
                        }
                    });
                }
            }, 500);
        }
    }
    
    // Método para limpar os mapas quando necessário
    static cleanup() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        if (this.homeMap) {
            this.homeMap.remove();
            this.homeMap = null;
        }
    }
}
