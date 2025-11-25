// Local storage management
class StorageManager {
    static getUsers() {
        return JSON.parse(localStorage.getItem('greenalert_users') || '[]');
    }
    
    static getReports() {
        return JSON.parse(localStorage.getItem('greenalert_reports') || '[]');
    }
    
    static getAlerts() {
        return JSON.parse(localStorage.getItem('greenalert_alerts') || '[]');
    }
    
    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('greenalert_current_user') || 'null');
    }
    
    static setCurrentUser(user) {
        localStorage.setItem('greenalert_current_user', JSON.stringify(user));
    }
    
    static clearCurrentUser() {
        localStorage.removeItem('greenalert_current_user');
    }
    
    static authenticateUser(email, password) {
        const users = this.getUsers();
        return users.find(user => user.email === email && user.password === password);
    }
    
    static registerUser(name, email, password) {
        const users = this.getUsers();
        
        // Check if user already exists
        if (users.find(user => user.email === email)) {
            return null;
        }
        
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            joined: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('greenalert_users', JSON.stringify(users));
        
        return newUser;
    }
    
    static saveReport(report) {
        const reports = this.getReports();
        reports.push(report);
        localStorage.setItem('greenalert_reports', JSON.stringify(reports));
    }
    
    static initializeSampleData() {
        // Initialize with sample data if empty
        if (!localStorage.getItem('greenalert_initialized')) {
            // Sample users
            const users = [
                {
                    id: '1',
                    name: 'João Silva',
                    email: 'joao@example.com',
                    password: '123456',
                    joined: new Date().toISOString()
                }
            ];
            localStorage.setItem('greenalert_users', JSON.stringify(users));
            
            // Sample reports are already in sample-data.js
            localStorage.setItem('greenalert_reports', JSON.stringify(sampleReports));
            localStorage.setItem('greenalert_alerts', JSON.stringify(sampleAlerts));
            
            localStorage.setItem('greenalert_initialized', 'true');
        }
    }
}