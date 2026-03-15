let jwt = require('jsonwebtoken')
let userController = require("../controllers/users");
module.exports = {
    checkLogin: function (req, res, next) {
        try {
            let token;
            if (req.cookies && req.cookies.token) {
                token = req.cookies.token;
            } else {
                let authorizationToken = req.headers.authorization;
                if (!authorizationToken || !authorizationToken.startsWith("Bearer")) {
                    return res.status(403).send({
                        message: "ban chua dang nhap"
                    });
                }
                token = authorizationToken.split(' ')[1];
            }
            let result = jwt.verify(token, 'HUTECH');
            // exp được set bằng Date.now() + ms khi tạo token
            if (result.exp > Date.now()) {
                req.userId = result.id;
                next();
            } else {
                return res.status(403).send({
                    message: "Token da het han, vui long dang nhap lai"
                });
            }
        } catch (error) {
            return res.status(403).send({
                message: "Token khong hop le, vui long dang nhap lai"
            });
        }
    },
    checkRole: function (...requiredRole) {
        return async function (req, res, next) {
            try {
                let userId = req.userId;
                let getUser = await userController.FindByID(userId);
                if (!getUser) {
                    return res.status(403).send({ message: "Nguoi dung khong ton tai" });
                }
                let roleName = getUser.role.name;
                if (requiredRole.includes(roleName)) {
                    next();
                } else {
                    return res.status(403).send({
                        message: "ban khong co quyen thuc hien hanh dong nay"
                    });
                }
            } catch (error) {
                return res.status(500).send({ message: "Loi kiem tra quyen" });
            }
        }
    }
}