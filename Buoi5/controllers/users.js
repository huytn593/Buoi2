let UserModel = require('../schemas/user');

const createUser = async (req, res) => {
    try {
        let { username, password, email, fullName, avatarUrl, role } = req.body;

        if (!username || !password || !email) {
            return res.status(400).send({
                message: 'username, password và email là bắt buộc'
            });
        }

        let newUser = new UserModel({
            username: username.trim(),
            password: password,
            email: email.trim().toLowerCase(),
            fullName: fullName ? fullName.trim() : '',
            avatarUrl: avatarUrl || undefined,
            role: role || undefined
        });

        await newUser.save();

        res.status(201).send({
            message: 'Tạo user thành công',
            data: newUser
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send({
                message: 'Username hoặc email đã tồn tại',
                error: error.message
            });
        }
        res.status(500).send({
            message: 'Lỗi server khi tạo user',
            error: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        let users = await UserModel
            .find({ isDeleted: false })
            .populate('role');

        res.send({
            total: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).send({
            message: 'Lỗi server khi lấy danh sách user',
            error: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        let { id } = req.params;

        let user = await UserModel
            .findOne({ _id: id, isDeleted: false })
            .populate('role');

        if (!user) {
            return res.status(404).send({ message: 'Không tìm thấy user' });
        }

        res.send({ data: user });
    } catch (error) {
        res.status(400).send({
            message: 'ID không hợp lệ hoặc user không tồn tại',
            error: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        let { id } = req.params;
        let body = req.body;

        delete body.isDeleted;

        let updatedUser = await UserModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            body,
            { new: true }
        ).populate('role');

        if (!updatedUser) {
            return res.status(404).send({ message: 'Không tìm thấy user để cập nhật' });
        }

        res.send({
            message: 'Cập nhật user thành công',
            data: updatedUser
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send({
                message: 'Username hoặc email đã tồn tại',
                error: error.message
            });
        }
        res.status(500).send({
            message: 'Lỗi server khi cập nhật user',
            error: error.message
        });
    }
};

const softDeleteUser = async (req, res) => {
    try {
        let { id } = req.params;

        let deletedUser = await UserModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!deletedUser) {
            return res.status(404).send({ message: 'Không tìm thấy user để xoá' });
        }

        res.send({
            message: 'Xoá user thành công (soft delete)',
            data: deletedUser
        });
    } catch (error) {
        res.status(500).send({
            message: 'Lỗi server khi xoá user',
            error: error.message
        });
    }
};

const enableUser = async (req, res) => {
    try {
        let { email, username } = req.body;

        if (!email || !username) {
            return res.status(400).send({ message: 'Vui lòng cung cấp cả email và username' });
        }

        let user = await UserModel.findOneAndUpdate(
            {
                email: email.trim().toLowerCase(),
                username: username.trim(),
                isDeleted: false
            },
            { status: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).send({
                message: 'Không tìm thấy user với email và username đã cung cấp'
            });
        }

        res.send({
            message: `Tài khoản "${user.username}" đã được kích hoạt`,
            data: user
        });
    } catch (error) {
        res.status(500).send({
            message: 'Lỗi server khi enable user',
            error: error.message
        });
    }
};

const disableUser = async (req, res) => {
    try {
        let { email, username } = req.body;

        if (!email || !username) {
            return res.status(400).send({ message: 'Vui lòng cung cấp cả email và username' });
        }

        let user = await UserModel.findOneAndUpdate(
            {
                email: email.trim().toLowerCase(),
                username: username.trim(),
                isDeleted: false
            },
            { status: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).send({
                message: 'Không tìm thấy user với email và username đã cung cấp'
            });
        }

        res.send({
            message: `Tài khoản "${user.username}" đã bị vô hiệu hoá`,
            data: user
        });
    } catch (error) {
        res.status(500).send({
            message: 'Lỗi server khi disable user',
            error: error.message
        });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    softDeleteUser,
    enableUser,
    disableUser
};
