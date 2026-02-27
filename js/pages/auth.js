/**
 * Auth Page Component
 * Handles Login, Register, and Forgot Password views
 */

// eslint-disable-next-line no-var
var AuthPage = (function () {
    'use strict';

    let _currentView = 'login'; // 'login', 'register', 'forgot'

    const MANGA_AUTH = [
        'assets/manga/manga_study.png',
        'assets/manga/manga_celebrate.png',
        'assets/manga/manga_reading.png',
        'assets/manga/manga_music.png',
        'assets/manga/manga_peace.png'
    ];
    const _authManga = MANGA_AUTH[Math.floor(Math.random() * MANGA_AUTH.length)];

    function render(containerEl) {
        containerEl.innerHTML = `
            <div class="auth-container">
                <div class="auth-card glass-panel fade-in">
                    <div class="auth-header">
                        <img src="${_authManga}" alt="" class="auth-manga-img" />
                        <h2>${_getViewTitle()}</h2>
                        <p class="text-secondary">${_getViewSubtitle()}</p>
                    </div>
                    
                    <form id="auth-form" class="auth-form">
                        ${_currentView === 'register' ? `
                        <div class="form-group">
                            <label class="form-label" for="auth-name">¿Cómo te llamas? 😊</label>
                            <input type="text" id="auth-name" class="form-control" placeholder="Tu nombre" required minlength="2" />
                        </div>
                        ` : ''}
                        
                        <div class="form-group">
                            <label class="form-label" for="auth-email">Correo Electrónico</label>
                            <input type="email" id="auth-email" class="form-control" placeholder="tu@email.com" required />
                        </div>
                        
                        ${_currentView !== 'forgot' ? `
                        <div class="form-group">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <label class="form-label" for="auth-password" style="margin-bottom:0;">Contraseña</label>
                                ${_currentView === 'login' ? `<a href="#" id="forgot-link" class="text-sm text-primary">¿Has olvidado tu contraseña?</a>` : ''}
                            </div>
                            <input type="password" id="auth-password" class="form-control" placeholder="••••••••" required minlength="6" />
                        </div>
                        ` : ''}
                        
                        ${_currentView === 'login' ? `
                        <div class="form-group checkbox-group">
                            <input type="checkbox" id="auth-remember" checked />
                            <label for="auth-remember">Recordarme en este dispositivo</label>
                        </div>
                        ` : ''}
                        
                        <button type="submit" class="btn btn-primary btn-block" style="margin-top: 1rem;" id="auth-submit-btn">
                            ${_getViewButtonText()}
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        ${_getFooterContent()}
                    </div>
                </div>
            </div>
        `;

        _attachEvents();
    }

    function _getViewTitle() {
        switch (_currentView) {
            case 'login': return '¡Hola de nuevo! 👋';
            case 'register': return '¡Únete! 🚀';
            case 'forgot': return 'Recuperar Contraseña 🔑';
        }
    }

    function _getViewSubtitle() {
        switch (_currentView) {
            case 'login': return 'Entra y domina tu semana 💪';
            case 'register': return 'Crea tu cuenta y empieza a arrasar en clase 🎯';
            case 'forgot': return 'Tranqui, te ayudamos a recuperarla 😎';
        }
    }

    function _getViewButtonText() {
        switch (_currentView) {
            case 'login': return '¡Vamos allá! 🔥';
            case 'register': return '¡Crear mi cuenta! ✨';
            case 'forgot': return 'Enviar instrucciones 📩';
        }
    }

    function _getFooterContent() {
        switch (_currentView) {
            case 'login':
                return `¿No tienes cuenta? <a href="#" id="register-link" class="text-primary">Regístrate</a>`;
            case 'register':
                return `¿Ya tienes cuenta? <a href="#" id="login-link" class="text-primary">Inicia Sesión</a>`;
            case 'forgot':
                return `<a href="#" id="back-login-link" class="text-primary">Volver al Inicio de Sesión</a>`;
        }
    }

    function _attachEvents() {
        const form = document.getElementById('auth-form');
        const submitBtn = document.getElementById('auth-submit-btn');

        // Toggle Views
        const registerLink = document.getElementById('register-link');
        const loginLink = document.getElementById('login-link');
        const forgotLink = document.getElementById('forgot-link');
        const backLoginLink = document.getElementById('back-login-link');

        if (registerLink) registerLink.addEventListener('click', (e) => { e.preventDefault(); _switchView('register'); });
        if (loginLink) loginLink.addEventListener('click', (e) => { e.preventDefault(); _switchView('login'); });
        if (forgotLink) forgotLink.addEventListener('click', (e) => { e.preventDefault(); _switchView('forgot'); });
        if (backLoginLink) backLoginLink.addEventListener('click', (e) => { e.preventDefault(); _switchView('login'); });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('auth-name');
            const displayName = nameInput ? nameInput.value.trim() : '';
            const email = document.getElementById('auth-email').value.trim();
            const passwordInput = document.getElementById('auth-password');
            const password = passwordInput ? passwordInput.value : '';

            // Basic validation
            if (_currentView === 'register' && !displayName) return Toast.show('Por favor ingresa tu nombre', 'error');
            if (!email) return Toast.show('Por favor ingresa un correo electrónico', 'error');
            if (_currentView !== 'forgot' && !password) return Toast.show('Por favor ingresa tu contraseña', 'error');

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Cargando...';
            submitBtn.disabled = true;

            try {
                if (_currentView === 'login') {
                    const { user, error } = await AuthService.signIn(email, password);
                    if (error) throw error;
                    Toast.show('Inicio de sesión exitoso', 'success');
                    // App level routing to dashboard
                    window.location.reload();
                } else if (_currentView === 'register') {
                    const { user, error } = await AuthService.signUp(email, password, displayName);
                    if (error) throw error;
                    Toast.show(`¡Bienvenido/a ${displayName}! Cuenta creada con éxito 🎉`, 'success');
                    window.location.reload();
                } else if (_currentView === 'forgot') {
                    const { error } = await AuthService.resetPasswordForEmail(email);
                    if (error) throw error;
                    Toast.show('📧 ¡Correo enviado! Revisa tu bandeja de entrada para restablecer tu contraseña', 'success');
                    // Delay before switching so user sees the success message
                    setTimeout(() => _switchView('login'), 2500);
                }
            } catch (err) {
                Toast.show(err.message || 'Ha ocurrido un error inesperado', 'error');
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    function _switchView(view) {
        _currentView = view;
        const containerEl = document.getElementById('auth-view');
        if (containerEl) render(containerEl);
    }

    return { render };
})();
