export const getLocalStorageItem = (key: string) => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
    }

    return null;
};

export const setLocalStorageItem = (key: string, value: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
    }
};

export const removeLocalStorageItem = (key: string) => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
    }
};

export const clearAuthState = () => {
    if (typeof window === 'undefined') {return;}

    /*
     * Only clear THE MOST essential auth-related keys for fastest possible performance
     * These are the keys that absolutely must be cleared for sign-out to work
     */
    const criticalKeys = [
        'sb-access-token',
        'supabase.auth.token'
    ];

    // Clear only critical keys immediately
    criticalKeys.forEach(key => {
        try {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        } catch (e) {
            // Silently fail
        }
    });

    // Handle the rest asynchronously
    setTimeout(() => {
        try {
            // Second tier of important auth-related keys
            const essentialKeys = [
                'sb-refresh-token',
                'supabase.auth.expires_at',
                'supabase.auth.refreshToken',
                'supabase.auth.expires_in',
                'sb-provider-token',
                'supabase.auth.provider-token',
            ];

            essentialKeys.forEach(key => {
                try {
                    localStorage.removeItem(key);
                    sessionStorage.removeItem(key);
                } catch (e) {
                    // Silently fail
                }
            });

            // Final cleanup in another timeout
            setTimeout(() => {
                try {
                    // Jumbo specific keys
                    const appKeys = [
                        'chatId',
                        'jumbo.token.balance',
                        'jumbo.chat.history',
                        'jumbo.user.preferences',
                    ];

                    appKeys.forEach(key => {
                        try {
                            localStorage.removeItem(key);
                            sessionStorage.removeItem(key);
                        } catch (e) {
                            // Silently fail
                        }
                    });

                    // Only do prefix-based cleaning as a very last step
                    Object.keys(localStorage).forEach(key => {
                        if (
                            key.startsWith('sb-') ||
                            key.includes('token') ||
                            key.includes('chat')
                        ) {
                            localStorage.removeItem(key);
                        }
                    });
                } catch (e) {
                    console.error('Error in final cache clearing:', e);
                }
            }, 200); // Further delay the least critical operations
        } catch (e) {
            console.error('Error in delayed cache clearing:', e);
        }
    }, 10); // Only wait 10ms for second tier
};
