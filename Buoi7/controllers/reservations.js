let reservationModel = require('../schemas/reservations')
let productModel = require('../schemas/products')
let mongoose = require('mongoose')

module.exports = {
    // Lấy tất cả reservations của user hiện tại
    GetAllByUser: async function (userId) {
        return await reservationModel
            .find({ user: userId })
            .populate({ path: 'items.product', select: 'title price images slug' })
            .sort({ createdAt: -1 })
    },

    // Lấy 1 reservation theo id (chỉ của user đó)
    GetOneByUser: async function (id, userId) {
        return await reservationModel
            .findOne({ _id: id, user: userId })
            .populate({ path: 'items.product', select: 'title price images slug' })
    },

    // Reserve toàn bộ giỏ hàng (cart) - tạo reservation rỗng (thêm items sau nếu cần)
    ReserveACart: async function (userId) {
        let newReservation = new reservationModel({
            user: userId,
            items: []
        })
        await newReservation.save()
        return newReservation
    },

    // Reserve danh sách sản phẩm cụ thể { items: [{product, quantity}] }
    ReserveItems: async function (userId, items) {
        // Kiểm tra tất cả product tồn tại trước khi tạo
        for (const item of items) {
            let product = await productModel.findOne({ _id: item.product, isDeleted: false })
            if (!product) {
                throw new Error(`Product ${item.product} khong ton tai`)
            }
        }
        let newReservation = new reservationModel({
            user: userId,
            items: items
        })
        await newReservation.save()
        return newReservation
    },

    // Huỷ reservation (dùng transaction)
    CancelReserve: async function (id, userId) {
        const session = await mongoose.startSession()
        session.startTransaction()
        try {
            let reservation = await reservationModel
                .findOne({ _id: id, user: userId })
                .session(session)

            if (!reservation) {
                await session.abortTransaction()
                session.endSession()
                return null
            }

            if (reservation.status === 'cancelled') {
                await session.abortTransaction()
                session.endSession()
                throw new Error('Reservation nay da bi huy truoc do')
            }

            reservation.status = 'cancelled'
            await reservation.save({ session })

            await session.commitTransaction()
            session.endSession()
            return reservation
        } catch (error) {
            await session.abortTransaction()
            session.endSession()
            throw error
        }
    }
}
