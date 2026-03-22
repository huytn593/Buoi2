var express = require('express')
var router = express.Router()
let { checkLogin } = require('../utils/authHandler')
let reservationController = require('../controllers/reservations')

// GET tất cả reservations của user hiện tại
// GET /reservations/
router.get('/', checkLogin, async function (req, res, next) {
    try {
        let result = await reservationController.GetAllByUser(req.userId)
        res.send(result)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// GET 1 reservation theo id của user hiện tại
// GET /reservations/:id
router.get('/:id', checkLogin, async function (req, res, next) {
    try {
        let result = await reservationController.GetOneByUser(req.params.id, req.userId)
        if (!result) {
            return res.status(404).send({ message: 'Reservation khong ton tai' })
        }
        res.send(result)
    } catch (error) {
        res.status(404).send({ message: 'id khong hop le' })
    }
})

// POST tạo reservation rỗng (reserve cart)
// POST /reservations/reserveACart
router.post('/reserveACart', checkLogin, async function (req, res, next) {
    try {
        let result = await reservationController.ReserveACart(req.userId)
        res.send(result)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// POST tạo reservation với danh sách sản phẩm
// POST /reservations/reserveItems
// body: { items: [ { product: "<id>", quantity: <number> }, ... ] }
router.post('/reserveItems', checkLogin, async function (req, res, next) {
    try {
        let { items } = req.body
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).send({ message: 'items phai la mang co it nhat 1 phan tu' })
        }
        let result = await reservationController.ReserveItems(req.userId, items)
        res.send(result)
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

// POST huỷ reservation (dùng transaction)
// POST /reservations/cancelReserve/:id
router.post('/cancelReserve/:id', checkLogin, async function (req, res, next) {
    try {
        let result = await reservationController.CancelReserve(req.params.id, req.userId)
        if (!result) {
            return res.status(404).send({ message: 'Reservation khong ton tai hoac khong thuoc ve ban' })
        }
        res.send(result)
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

module.exports = router
