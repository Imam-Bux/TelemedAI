import * as authService from './service.js';

const setAuthCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

const signUp = async (req, res) => {
    const payload = {
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password
    };
    const result = await authService.signUP(payload);
    if (result?.error) {
        return res.status(400).json(result);
    }
    setAuthCookie(res, result.token);
    return res.json({
        completedOnboarding: result.completedOnboarding,
        mustChangePassword: result.mustChangePassword,
        user: result.user
    });
};

const login = async (req, res) => {
    const payload = {
        email: req.body?.email,
        password: req.body?.password
    };
    const result = await authService.login(payload);
    if (result?.error) {
        return res.status(400).json(result);
    }
    setAuthCookie(res, result.token);
    return res.json({
        completedOnboarding: result.completedOnboarding,
        mustChangePassword: result.mustChangePassword,
        user: result.user
    });
};

const getPing = (req, res) => {
    res.status(200).send("success");
};

const getProfile = async (req, res) => {
    const user = res.locals.user;
    try {
        const data = await authService.getUserProfile(user.id);
        if (data) {
            return res.json({
                id: data._id,
                email: data.email,
                fullName: data.fullName,
                role: data.role,
                mustChangePassword: data.mustChangePassword || false
            });
        }
    } catch (err) {
        // DB is momentarily unreachable (e.g. serverless connection reconnecting).
        // Fall back to the data already inside the verified JWT so the auth
        // guard never fails just because of a transient DB hiccup.
        console.error('getProfile DB lookup failed, using token data:', err.message);
    }
    return res.json({
        id: user.id,
        email: user.email || '',
        fullName: user.fullName || '',
        role: user.role || '',
        mustChangePassword: user.mustChangePassword || false
    });
};

const deleteUser = async (req, res) => {
    const user = res.locals.user;
    const userId = user.id;
    const result = await authService.deleteUserAccount(userId);
    if (result?.error) {
        return res.status(400).json(result);
    }
    return res.json(result);
};

const logout = (req, res) => {
    res.clearCookie('token', { path: '/' });
    return res.json({ success: true });
};

export { signUp, login, getPing, getProfile, deleteUser, logout };