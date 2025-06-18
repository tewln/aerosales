const sessionAuthMiddleware = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Пользователь не авторизован'
        });
    }
    
    req.user = req.session.user;
    next();
};

const sessionRoleMiddleware = (requiredRoles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не аутентифицирован'
            });
        }

        const userRole = req.session.user.role;
        
        if (!requiredRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Недостаточно прав доступа'
            });
        }

        req.user = req.session.user;
        next();
    };
};

module.exports = {
    sessionAuthMiddleware,
    sessionRoleMiddleware
};