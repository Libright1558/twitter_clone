import { Request, Response } from '..';

const logout = async (req: Request, res: Response) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        if (cookies.access) res.clearCookie('access', { httpOnly: true, sameSite: true, maxAge: 15 * 60 * 1000 });
        return res.redirect(401, './login');
    }

    res.clearCookie('jwt', { httpOnly: true, sameSite: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.clearCookie('access', { httpOnly: true, sameSite: true, maxAge: 2 * 60 * 1000 });
    return res.redirect(200, './login');
};

export default {
    logout
};
