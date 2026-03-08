let RoleModel = require('../schemas/role');

const createRole = async (req, res) => {
    try {
        let { name, description } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).send({ message: 'Tên vai trò (name) là bắt buộc' });
        }

        let newRole = new RoleModel({
            name: name.trim(),
            description: description ? description.trim() : ''
        });

        await newRole.save();

        res.status(201).send({
            message: 'Tạo role thành công',
            data: newRole
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send({ message: 'Tên role đã tồn tại' });
        }
        res.status(500).send({
            message: 'Lỗi server khi tạo role',
            error: error.message
        });
    }
};

const getAllRoles = async (req, res) => {
    try {
        let roles = await RoleModel.find({ isDeleted: false });

        res.send({
            total: roles.length,
            data: roles
        });
    } catch (error) {
        res.status(500).send({
            message: 'Lỗi server khi lấy danh sách role',
            error: error.message
        });
    }
};

const getRoleById = async (req, res) => {
    try {
        let { id } = req.params;

        let role = await RoleModel.findOne({ _id: id, isDeleted: false });

        if (!role) {
            return res.status(404).send({ message: 'Không tìm thấy role' });
        }

        res.send({ data: role });
    } catch (error) {
        res.status(400).send({
            message: 'ID không hợp lệ hoặc role không tồn tại',
            error: error.message
        });
    }
};

const updateRole = async (req, res) => {
    try {
        let { id } = req.params;
        let body = req.body;

        delete body.isDeleted;

        let updatedRole = await RoleModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            body,
            { new: true }
        );

        if (!updatedRole) {
            return res.status(404).send({ message: 'Không tìm thấy role để cập nhật' });
        }

        res.send({
            message: 'Cập nhật role thành công',
            data: updatedRole
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send({ message: 'Tên role đã tồn tại' });
        }
        res.status(500).send({
            message: 'Lỗi server khi cập nhật role',
            error: error.message
        });
    }
};

const softDeleteRole = async (req, res) => {
    try {
        let { id } = req.params;

        let deletedRole = await RoleModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!deletedRole) {
            return res.status(404).send({ message: 'Không tìm thấy role để xoá' });
        }

        res.send({
            message: 'Xoá role thành công (soft delete)',
            data: deletedRole
        });
    } catch (error) {
        res.status(500).send({
            message: 'Lỗi server khi xoá role',
            error: error.message
        });
    }
};

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    softDeleteRole
};
