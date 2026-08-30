import * as authService from './service.js';

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
    res.cookie('token', result.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
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
    res.cookie('token', result.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
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
    const userId = user.id;
    const data = await authService.getUserProfile(userId);
    if (!data) {
        return res.status(401).json({ error: true, message: 'User not found' });
    }
    return res.json({
        id: data._id,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        mustChangePassword: data.mustChangePassword || false
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