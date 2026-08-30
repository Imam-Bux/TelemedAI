import userModel from '../../model/user.js';

const signUp = async (payload) => {
    try {
        return await userModel.create(payload);
    } catch (err) {
        return {
            error: true,
            message: err.message
        };
    }
};

const getUserbyEmail = async (email) => {
    const resp = await userModel.findOne({ email: email });
    return resp;
};

const getUserById = async (id) => {
    // never send the password hash to the client
    const resp = await userModel.findById(id).select('-password');
    return resp;
};

const deleteUser = async (id) => {
    try {
        const resp = await userModel.findByIdAndDelete(id);
        return resp;
    } catch (err) {
        return {
            error: true,
            message: err.message
        };
    }
};

export { signUp, getUserbyEmail, getUserById, deleteUser };