const logout = async (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        if(cookies.access) res.clearCookie('access', { httpOnly: true, sameSite: true, maxAge: 15 * 60 * 1000 });
        return res.redirect("./login");
    }

    res.clearCookie('jwt', { httpOnly: true, sameSite: true, maxAge: 24 * 60 * 60 * 1000 });
    res.clearCookie('access', { httpOnly: true, sameSite: true, maxAge: 15 * 60 * 1000 });
    return res.redirect("./login");
}

export default {
    logout,
}