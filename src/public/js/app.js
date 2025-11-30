const API_URL = '/api/v1';

const App = {
    state: {
        user: null,
        token: null,
        currentStore: null
    },

    init() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (token && user) {
            this.state.token = token;
            this.state.user = user;
            this.updateAuthUI();

            // If on login page, redirect to dashboard
            if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                window.location.href = '/dashboard.html';
            }
        } else {
            // If not on login page, redirect to login
            if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
                window.location.href = '/';
            }
        }
    },

    updateAuthUI() {
        // Update UI elements based on auth state
        const userEmail = document.getElementById('user-email');
        if (userEmail && this.state.user) {
            userEmail.textContent = this.state.user.email;
        }
    },

    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Login failed');

            this.setSession(data.token, data.user);
            window.location.href = '/dashboard.html';

        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async signup(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Signup failed');

            this.setSession(data.token, data.user);
            window.location.href = '/dashboard.html';

        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.state.token = null;
        this.state.user = null;
        window.location.href = '/';
    },

    setSession(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.state.token = token;
        this.state.user = user;
    },

    async authenticatedFetch(url, options = {}) {
        if (!this.state.token) {
            window.location.href = '/';
            throw new Error('No token found');
        }

        const headers = {
            'Authorization': `Bearer ${this.state.token}`,
            ...options.headers
        };

        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            this.logout();
            throw new Error('Session expired');
        }

        return response;
    }
};

// Initialize app
App.init();
