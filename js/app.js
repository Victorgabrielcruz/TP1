// Main application logic
class GreenAlertApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'home';
        this.init();
    }

    init() {
        // Initialize storage with sample data if empty
        if (!StorageManager.getReports().length) {
            StorageManager.initializeSampleData();
        }

        // Load current user from localStorage
        this.currentUser = StorageManager.getCurrentUser();

        // Render all page content
        this.renderHomePage();
        this.renderMapPage();
        this.renderReportPage();
        this.renderAlertsPage();
        this.renderModals();
        this.renderFooter();

        // Set up event listeners
        this.setupEventListeners();

        // Show home page by default
        this.showPage('home');
    }

    setupEventListeners() {
        // Page navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.showPage(page);
            });
        });

        // Login/Register modals
        document.getElementById('loginBtn').addEventListener('click', () => {
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        });

        document.getElementById('registerBtn').addEventListener('click', () => {
            const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
            registerModal.show();
        });

        // Form submissions
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('report-form').addEventListener('submit', (e) => this.handleReportSubmit(e));

        // Other interactive elements
        document.getElementById('get-location-btn').addEventListener('click', () => this.getCurrentLocation());
        document.getElementById('alert-radius').addEventListener('input', (e) => {
            document.getElementById('radius-value').textContent = e.target.value + ' km';
        });

        // Update user interface based on login state
        this.updateUI();
    }

    showPage(page) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Show selected page
        document.querySelectorAll('.page-content').forEach(pageEl => {
            pageEl.classList.add('d-none');
        });
        document.getElementById(`${page}-page`).classList.remove('d-none');

        this.currentPage = page;

        // Page-specific initialization
        if (page === 'map') {
            MapManager.initMap();
        }
    }

    renderHomePage() {
        const reports = StorageManager.getReports();
        const activeFires = reports.filter(r => r.status === 'active').length;
        const reportsToday = reports.filter(r => {
            const today = new Date().toDateString();
            return new Date(r.date).toDateString() === today;
        }).length;

        document.getElementById('home-page').innerHTML = `
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><i class="bi bi-map"></i> Mapa de Queimadas</h5>
                        </div>
                        <div class="card-body p-0">
                            <div class="map-container">
                                <div id="home-map"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><i class="bi bi-graph-up"></i> Estatísticas</h5>
                        </div>
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-6 stats-card">
                                    <div class="stats-number" id="active-fires">${activeFires}</div>
                                    <div>Focos Ativos</div>
                                </div>
                                <div class="col-6 stats-card">
                                    <div class="stats-number" id="reports-today">${reportsToday}</div>
                                    <div>Relatos Hoje</div>
                                </div>
                                <div class="col-6 stats-card">
                                    <div class="stats-number" id="resolved-cases">${reports.filter(r => r.status === 'resolved').length}</div>
                                    <div>Casos Resolvidos</div>
                                </div>
                                <div class="col-6 stats-card">
                                    <div class="stats-number" id="air-quality">67%</div>
                                    <div>Qualidade do Ar</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><i class="bi bi-exclamation-triangle"></i> Alertas Recentes</h5>
                        </div>
                        <div class="card-body">
                            ${this.renderRecentAlerts()}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><i class="bi bi-newspaper"></i> Notícias e Campanhas</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h6>Campanha: Verão Consciente</h6>
                                            <p>Participe da nossa campanha de prevenção a queimadas no verão.</p>
                                            <button class="btn btn-sm btn-outline-primary">Saiba mais</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h6>Dica: Como Evitar Queimadas</h6>
                                            <p>Aprenda práticas simples para prevenir incêndios florestais.</p>
                                            <button class="btn btn-sm btn-outline-primary">Ler mais</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h6>Evento: Dia do Voluntário</h6>
                                            <p>Junte-se a nós no próximo sábado para ações de conscientização.</p>
                                            <button class="btn btn-sm btn-outline-primary">Participar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize home map
        MapManager.initHomeMap();
    }

    renderRecentAlerts() {
        const alerts = StorageManager.getAlerts();
        return alerts.slice(0, 3).map(alert => `
            <div class="alert-item">
                <h6>${alert.title}</h6>
                <p class="mb-1">${alert.description}</p>
                <small class="text-muted">${new Date(alert.date).toLocaleString()}</small>
            </div>
        `).join('');
    }

    renderMapPage() {
        document.getElementById('map-page').innerHTML = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0"><i class="bi bi-map"></i> Mapa Interativo de Queimadas</h5>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-2" id="filter-btn">
                            <i class="bi bi-funnel"></i> Filtros
                        </button>
                        <button class="btn btn-sm btn-primary" id="my-location-btn">
                            <i class="bi bi-geo-alt"></i> Minha Localização
                        </button>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="map-container">
                        <div id="map"></div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><i class="bi bi-list-ul"></i> Incidentes Recentes</h5>
                        </div>
                        <div class="card-body">
                            <div class="list-group" id="incidents-list">
                                ${this.renderIncidentsList()}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><i class="bi bi-info-circle"></i> Informações da Região</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <h6>Qualidade do Ar</h6>
                                <div class="progress">
                                    <div class="progress-bar bg-success" role="progressbar" style="width: 67%">67% - Moderada</div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <h6>Umidade</h6>
                                <div class="progress">
                                    <div class="progress-bar bg-info" role="progressbar" style="width: 42%">42% - Baixa</div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <h6>Temperatura</h6>
                                <div class="progress">
                                    <div class="progress-bar bg-warning" role="progressbar" style="width: 78%">32°C - Alta</div>
                                </div>
                            </div>
                            <div>
                                <h6>Recomendações</h6>
                                <ul>
                                    <li>Evite queimas ao ar livre</li>
                                    <li>Mantenha áreas limpas de vegetação seca</li>
                                    <li>Tenha cuidado com bitucas de cigarro</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderIncidentsList() {
        const reports = StorageManager.getReports();
        return reports.slice(0, 5).map(report => `
            <div class="list-group-item incident-card" data-id="${report.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1"><i class="bi bi-fire fire-icon"></i> ${report.location}</h6>
                    <span class="status-badge status-${report.status === 'active' ? 'in-progress' : report.status === 'pending' ? 'pending' : 'resolved'}">
                        ${report.status === 'active' ? 'Em Atendimento' : report.status === 'pending' ? 'Em Análise' : 'Resolvido'}
                    </span>
                </div>
                <p class="mb-1">${report.description.substring(0, 50)}...</p>
                <small class="text-muted">${new Date(report.date).toLocaleString()}</small>
            </div>
        `).join('');
    }

    renderReportPage() {
        document.getElementById('report-page').innerHTML = `
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><i class="bi bi-plus-circle"></i> Reportar Foco de Queimada</h5>
                        </div>
                        <div class="card-body">
                            <form id="report-form">
                                <div class="mb-3">
                                    <label for="location" class="form-label">Localização</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="location" placeholder="Digite o endereço ou use sua localização atual">
                                        <button class="btn btn-outline-secondary" type="button" id="get-location-btn">
                                            <i class="bi bi-geo-alt"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="fire-type" class="form-label">Tipo de Ocorrência</label>
                                    <select class="form-select" id="fire-type">
                                        <option selected>Selecione o tipo...</option>
                                        <option value="small">Pequeno foco</option>
                                        <option value="medium">Queimada média</option>
                                        <option value="large">Incêndio florestal</option>
                                        <option value="risk">Risco potencial</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="description" class="form-label">Descrição</label>
                                    <textarea class="form-control" id="description" rows="3" placeholder="Descreva o que você observou..."></textarea>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="photo" class="form-label">Foto (opcional)</label>
                                    <input type="file" class="form-control" id="photo" accept="image/*">
                                </div>
                                
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="urgent">
                                        <label class="form-check-label" for="urgent">
                                            Marcar como urgente
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="d-grid gap-2">
                                    <button type="submit" class="btn btn-primary">Enviar Relatório</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <div class="card mt-4">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><i class="bi bi-clock-history"></i> Meus Relatórios Recentes</h5>
                        </div>
                        <div class="card-body">
                            <div class="list-group" id="my-reports">
                                ${this.renderUserReports()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderUserReports() {
        if (!this.currentUser) return '<p class="text-muted">Faça login para ver seus relatórios.</p>';
        
        const userReports = StorageManager.getReports().filter(r => r.userId === this.currentUser.id);
        if (userReports.length === 0) return '<p class="text-muted">Você ainda não enviou nenhum relatório.</p>';
        
        return userReports.slice(0, 5).map(report => `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${report.location} - ${new Date(report.date).toLocaleDateString()}</h6>
                    <span class="status-badge status-${report.status === 'active' ? 'in-progress' : report.status === 'pending' ? 'pending' : 'resolved'}">
                        ${report.status === 'active' ? 'Em Atendimento' : report.status === 'pending' ? 'Em Análise' : 'Resolvido'}
                    </span>
                </div>
                <p class="mb-1">${report.description.substring(0, 50)}...</p>
            </div>
        `).join('');
    }

    renderAlertsPage() {
        document.getElementById('alerts-page').innerHTML = `
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><i class="bi bi-bell"></i> Alertas e Notificações</h5>
                        </div>
                        <div class="card-body" id="alerts-list">
                            ${this.renderAllAlerts()}
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><i class="bi bi-gear"></i> Configurações de Alertas</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label class="form-label">Receber alertas para:</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="alert-fires" checked>
                                    <label class="form-check-label" for="alert-fires">
                                        Focos de queimada
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="alert-weather" checked>
                                    <label class="form-check-label" for="alert-weather">
                                        Condições climáticas de risco
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="alert-campaigns">
                                    <label class="form-check-label" for="alert-campaigns">
                                        Campanhas educativas
                                    </label>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="alert-radius" class="form-label">Raio de alerta (km)</label>
                                <input type="range" class="form-range" id="alert-radius" min="5" max="100" value="25">
                                <div class="text-center" id="radius-value">25 km</div>
                            </div>
                            
                            <div class="d-grid">
                                <button class="btn btn-primary" id="save-alert-settings">Salvar Configurações</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mt-4">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><i class="bi bi-shield-check"></i> Dicas de Prevenção</h5>
                        </div>
                        <div class="card-body">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item">Não queime lixo ou restos de poda</li>
                                <li class="list-group-item">Mantenha faixas limpas ao redor de propriedades</li>
                                <li class="list-group-item">Tenha cuidado com fogueiras e churrasqueiras</li>
                                <li class="list-group-item">Não solte balões</li>
                                <li class="list-group-item">Armazene combustíveis com segurança</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAllAlerts() {
        const alerts = StorageManager.getAlerts();
        return alerts.map(alert => `
            <div class="alert alert-${alert.type}" role="alert">
                <h6><i class="bi ${alert.icon}"></i> ${alert.title}</h6>
                <p class="mb-0">${alert.description}</p>
                <small class="text-muted">Publicado: ${new Date(alert.date).toLocaleString()}</small>
            </div>
        `).join('');
    }

    renderModals() {
        // Login Modal
        document.getElementById('loginModal').innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Entrar no GreenAlert</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="login-container">
                            <form id="login-form">
                                <div class="mb-3">
                                    <label for="login-email" class="form-label">E-mail</label>
                                    <input type="email" class="form-control" id="login-email" required>
                                </div>
                                <div class="mb-3">
                                    <label for="login-password" class="form-label">Senha</label>
                                    <input type="password" class="form-control" id="login-password" required>
                                </div>
                                <div class="mb-3 form-check">
                                    <input type="checkbox" class="form-check-input" id="remember-me">
                                    <label class="form-check-label" for="remember-me">Lembrar de mim</label>
                                </div>
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary">Entrar</button>
                                </div>
                            </form>
                            
                            <div class="text-center my-3">ou</div>
                            
                            <div class="social-login">
                                <button class="social-btn google-btn">
                                    <i class="bi bi-google"></i> Google
                                </button>
                                <button class="social-btn facebook-btn">
                                    <i class="bi bi-facebook"></i> Facebook
                                </button>
                                <button class="social-btn apple-btn">
                                    <i class="bi bi-apple"></i> Apple
                                </button>
                            </div>
                            
                            <div class="text-center mt-3">
                                <a href="#" class="text-decoration-none">Esqueci minha senha</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Register Modal
        document.getElementById('registerModal').innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Cadastrar no GreenAlert</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="login-container">
                            <form id="register-form">
                                <div class="mb-3">
                                    <label for="register-name" class="form-label">Nome completo</label>
                                    <input type="text" class="form-control" id="register-name" required>
                                </div>
                                <div class="mb-3">
                                    <label for="register-email" class="form-label">E-mail</label>
                                    <input type="email" class="form-control" id="register-email" required>
                                </div>
                                <div class="mb-3">
                                    <label for="register-password" class="form-label">Senha</label>
                                    <input type="password" class="form-control" id="register-password" required>
                                </div>
                                <div class="mb-3">
                                    <label for="register-confirm" class="form-label">Confirmar senha</label>
                                    <input type="password" class="form-control" id="register-confirm" required>
                                </div>
                                <div class="mb-3 form-check">
                                    <input type="checkbox" class="form-check-input" id="accept-terms" required>
                                    <label class="form-check-label" for="accept-terms">
                                        Aceito os <a href="#" class="text-decoration-none">termos de uso</a> e <a href="#" class="text-decoration-none">política de privacidade</a>
                                    </label>
                                </div>
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary">Cadastrar</button>
                                </div>
                            </form>
                            
                            <div class="text-center my-3">ou</div>
                            
                            <div class="social-login">
                                <button class="social-btn google-btn">
                                    <i class="bi bi-google"></i> Google
                                </button>
                                <button class="social-btn facebook-btn">
                                    <i class="bi bi-facebook"></i> Facebook
                                </button>
                                <button class="social-btn apple-btn">
                                    <i class="bi bi-apple"></i> Apple
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFooter() {
        document.querySelector('.footer').innerHTML = `
            <div class="container">
                <div class="row">
                    <div class="col-md-4">
                        <h5><i class="bi bi-tree-fill"></i> GreenAlert</h5>
                        <p>Conectando cidadãos e órgãos ambientais para monitorar, prevenir e conscientizar sobre queimadas.</p>
                    </div>
                    <div class="col-md-4">
                        <h5>Links Rápidos</h5>
                        <ul class="list-unstyled">
                            <li><a href="#" class="text-white text-decoration-none">Sobre nós</a></li>
                            <li><a href="#" class="text-white text-decoration-none">Política de Privacidade</a></li>
                            <li><a href="#" class="text-white text-decoration-none">Termos de Uso</a></li>
                            <li><a href="#" class="text-white text-decoration-none">Contato</a></li>
                        </ul>
                    </div>
                    <div class="col-md-4">
                        <h5>Contato</h5>
                        <ul class="list-unstyled">
                            <li><i class="bi bi-envelope"></i> contato@greenalert.org</li>
                            <li><i class="bi bi-telephone"></i> (31) 3456-7890</li>
                            <li><i class="bi bi-geo-alt"></i> Belo Horizonte, MG</li>
                        </ul>
                    </div>
                </div>
                <hr class="my-3">
                <div class="text-center">
                    <p>&copy; 2025 GreenAlert. Todos os direitos reservados.</p>
                </div>
            </div>
        `;
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const user = StorageManager.authenticateUser(email, password);
        if (user) {
            this.currentUser = user;
            StorageManager.setCurrentUser(user);
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            this.updateUI();
            alert('Login realizado com sucesso!');
        } else {
            alert('E-mail ou senha incorretos.');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;

        if (password !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }

        const user = StorageManager.registerUser(name, email, password);
        if (user) {
            this.currentUser = user;
            StorageManager.setCurrentUser(user);
            bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
            this.updateUI();
            alert('Cadastro realizado com sucesso!');
        } else {
            alert('Este e-mail já está cadastrado.');
        }
    }

    handleReportSubmit(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            alert('Por favor, faça login para reportar uma queimada.');
            return;
        }

        const location = document.getElementById('location').value;
        const fireType = document.getElementById('fire-type').value;
        const description = document.getElementById('description').value;
        const urgent = document.getElementById('urgent').checked;

        if (!location || !fireType || !description) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const report = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            location,
            type: fireType,
            description,
            urgent,
            status: 'pending',
            date: new Date().toISOString(),
            coordinates: { lat: -19.9167, lng: -43.9345 } // Default to BH coordinates
        };

        StorageManager.saveReport(report);
        document.getElementById('report-form').reset();
        
        // Update the user reports list
        document.getElementById('my-reports').innerHTML = this.renderUserReports();
        
        alert('Relatório enviado com sucesso! Obrigado por contribuir.');
    }

    getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    document.getElementById('location').value = `Localização atual (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
                },
                (error) => {
                    alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
                }
            );
        } else {
            alert('Geolocalização não é suportada pelo seu navegador.');
        }
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');

        if (this.currentUser) {
            loginBtn.textContent = this.currentUser.name;
            registerBtn.textContent = 'Sair';
            registerBtn.classList.remove('btn-primary');
            registerBtn.classList.add('btn-outline-secondary');
            
            // Change register button to logout functionality
            registerBtn.onclick = () => {
                this.currentUser = null;
                StorageManager.clearCurrentUser();
                this.updateUI();
                alert('Logout realizado com sucesso.');
            };
        } else {
            loginBtn.textContent = 'Entrar';
            registerBtn.textContent = 'Cadastrar';
            registerBtn.classList.remove('btn-outline-secondary');
            registerBtn.classList.add('btn-primary');
            
            // Reset register button to original functionality
            registerBtn.onclick = () => {
                const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
                registerModal.show();
            };
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GreenAlertApp();
});