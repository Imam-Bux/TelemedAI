// NOTE: auth is now handled entirely by the httpOnly "token" cookie the backend sets.
// This service no longer deals with any JWT/token — it only caches non-sensitive
// user display info (name/email/role) in localStorage for convenience.

const tokenService = {
    getUser: () => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        }
        return null;
    },

    setUser: (user: Record<string, unknown>) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
        }
    },

    removeUser: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
        }
    },

    logout: async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
            console.error('Logout error:', err);
        }
        tokenService.removeUser();
    }
};

export default tokenService;