// Sample data for the application
const sampleReports = [
    {
        id: '1',
        userId: '1',
        location: 'Parque Nacional',
        type: 'medium',
        description: 'Foco de queimada próximo à trilha principal do parque. Fumaça visível a distância.',
        urgent: true,
        status: 'active',
        date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        coordinates: { lat: -19.93, lng: -43.95 }
    },
    {
        id: '2',
        userId: '1',
        location: 'Zona Rural - região norte',
        type: 'large',
        description: 'Incêndio de grandes proporções em área de pastagem. Ventos fortes podem espalhar as chamas.',
        urgent: true,
        status: 'active',
        date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        coordinates: { lat: -19.89, lng: -43.92 }
    },
    {
        id: '3',
        userId: '1',
        location: 'Reserva Florestal',
        type: 'small',
        description: 'Pequeno foco próximo à área de preservação. Já controlado pelas equipes.',
        urgent: false,
        status: 'resolved',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        coordinates: { lat: -19.91, lng: -43.98 }
    },
    {
        id: '4',
        userId: '1',
        location: 'Área de Proteção Ambiental',
        type: 'risk',
        description: 'Acúmulo de material inflamável. Risco potencial de queimada.',
        urgent: false,
        status: 'pending',
        date: new Date().toISOString(),
        coordinates: { lat: -19.94, lng: -43.91 }
    }
];

const sampleAlerts = [
    {
        id: '1',
        title: 'Alerta de Temperatura Alta',
        description: 'Previsão de temperaturas acima de 35°C na região nos próximos dias. Risco elevado de queimadas.',
        type: 'warning',
        icon: 'bi-exclamation-triangle',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
        id: '2',
        title: 'Campanha de Prevenção',
        description: 'Participe da campanha "Verão Consciente" e aprenda a prevenir queimadas em sua propriedade.',
        type: 'info',
        icon: 'bi-info-circle',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
        id: '3',
        title: 'Foco Ativo - Área de Preservação',
        description: 'Foco de queimada detectado na Reserva Biológica. Equipes em deslocamento.',
        type: 'danger',
        icon: 'bi-fire',
        date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() // 2 days ago
    },
    {
        id: '4',
        title: 'Queimada Controlada',
        description: 'Incêndio no Parque Estadual foi completamente controlado pelas equipes de bombeiros.',
        type: 'success',
        icon: 'bi-check-circle',
        date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() // 3 days ago
    }
];