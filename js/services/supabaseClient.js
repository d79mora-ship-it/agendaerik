/**
 * Supabase Client Initialization
 * Connects to the real Supabase project
 */

// eslint-disable-next-line no-var
var supabase;

(function () {
    'use strict';

    const SUPABASE_URL = 'https://wngjnzvxyqmzchcejwpa.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZ2puenZ4eXFtemNoY2Vqd3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDU0OTYsImV4cCI6MjA4NzcyMTQ5Nn0.FJ7kmp9HigbwSxF7z-hJgSlWQ7eiZJyubhm4Qr6RryY';

    // We verify window.supabase exists (loaded via CDN) before creating the client
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error('Supabase library not loaded');
    }
})();
