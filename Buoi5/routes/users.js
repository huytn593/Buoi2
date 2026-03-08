let express = require('express');
let router = express.Router();

let {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    softDeleteUser,
    enableUser,
    disableUser
} = require('../controllers/users');

router.post('/enable', enableUser);
router.post('/disable', disableUser);

router.route('/')
    .get(getAllUsers)
    .post(createUser);

router.route('/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(softDeleteUser);

module.exports = router;
