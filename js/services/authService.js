/**
 * AuthService — Supabase Authentication service
 */

// eslint-disable-next-line no-var
var AuthService = (function () {
    'use strict';

    let _currentUser = null;

    /**
     * Register a new user with Supabase
     * @param {string} email
     * @param {string} password
     * @param {string} [displayName] — Name shown in the app
     * @returns {Promise<{user: Object|null, error: Object|null}>}
     */
    async function signUp(email, password, displayName) {
        if (!window.supabase) return { user: null, error: { message: 'Supabase no inicializado' } };
        const options = { email, password };
        if (displayName) {
            options.options = { data: { full_name: displayName } };
        }
        const { data, error } = await window.supabase.auth.signUp(options);
        if (data && data.user) {
            _currentUser = data.user;
        }
        return { user: data?.user || null, error };
    }

    /**
     * Log in an existing user with Supabase
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{user: Object|null, error: Object|null}>}
     */
    async function signIn(email, password) {
        if (!window.supabase) return { user: null, error: { message: 'Supabase no inicializado' } };
        const { data, error } = await window.supabase.auth.signInWithPassword({ email, password });
        if (data && data.user) {
            _currentUser = data.user;
        }
        return { user: data?.user || null, error };
    }

    /**
     * Log out current user
     * @returns {Promise<{error: Object|null}>}
     */
    async function signOut() {
        if (!window.supabase) return { error: { message: 'Supabase no inicializado' } };
        const { error } = await window.supabase.auth.signOut();
        _currentUser = null;
        return { error };
    }

    /**
     * Reset password via email
     * @param {string} email
     * @returns {Promise<{error: Object|null}>}
     */
    async function resetPasswordForEmail(email) {
        if (!window.supabase) return { error: { message: 'Supabase no inicializado' } };
        const { error } = await window.supabase.auth.resetPasswordForEmail(email);
        return { error };
    }

    /**
     * Get the session asynchronously from Supabase Auth
     * @returns {Promise<{session: Object|null, user: Object|null, error: Object|null}>}
     */
    async function getSession() {
        if (!window.supabase) return { session: null, user: null, error: { message: 'Supabase no inicializado' } };
        const { data: { session }, error } = await window.supabase.auth.getSession();
        _currentUser = session?.user || null;
        return { session, user: _currentUser, error };
    }

    /**
     * Initialize Auth state change listeners
     */
    async function _initSession() {
        if (!window.supabase) return;
        window.supabase.auth.onAuthStateChange((event, session) => {
            _currentUser = session?.user || null;
            if (event === 'SIGNED_OUT') {
                window.location.reload();
            }
        });
    }

    /**
     * Get current active session user synchronously
     * @returns {Object|null}
     */
    function getCurrentUser() {
        return _currentUser;
    }

    return {
        signUp,
        signIn,
        signOut,
        resetPasswordForEmail,
        getCurrentUser,
        getSession,
        _initSession
    };
})();
