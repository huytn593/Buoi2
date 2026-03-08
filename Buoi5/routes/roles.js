let express = require('express');
let router = express.Router();

let {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    softDeleteRole
} = require('../controllers/roles');

router.route('/')
    .get(getAllRoles)
    .post(createRole);

router.route('/:id')
    .get(getRoleById)
    .put(updateRole)
    .delete(softDeleteRole);

module.exports = router;
