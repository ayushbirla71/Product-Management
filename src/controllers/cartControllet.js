const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const { isValidObjectId } = require('../validators/validations')

const createCart = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Pls provide valid userId" })
        let userData = await userModel.findById(userId)
        if (!userData) return res.status(404).send({ status: false, message: "user not found" })
        let { cartId, productId } = req.body
        if (!productId || !isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Pls provide valid productId" })
        let cartData = await cartModel.findOne({ userId: userId })
        if (cartData) {
            if (!cartId) return res.status(400).send({ status: false, message: "user cart exist pls provide cart id" })
            if (cartId) {
                if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Pls provide valid cartId" })
                if (cartData._id != cartId) return res.status(400).send({ status: false, message: "this cart id does not match" })
            }
        }
        let productData = await productModel.findById(productId)
        if (!productData) return res.status(404).send({ status: false, message: "Product not found" })
        //-----------------------Authorization-----------------//
        if (userId != req.userId) return res.status(403).send({ status: false, message: "Unauthorization error" })
        //----------------------------------------------------//
        let { price } = productData
        let Obj = {}
        let CreateCart
        if (!cartId) {
            Obj = { userId, totalPrice: price, totalItems: 1 }
            Obj.items = { productId, quantity: 1 }
            CreateCart = await cartModel.create(Obj)
        }
        else {
            let cartData = await cartModel.findById(cartId).select({ items: 1, totalItems: 1, totalPrice: 1 })
            let xyz = cartData.items
            let ab = true
            for (let i = 0; i < xyz.length; i++) {
                let ele = xyz[i]
                if (ele.productId == productId) {
                    let a = { productId, quantity: ele.quantity + 1 }
                    cartData.items[i] = a
                    cartData.totalItems = xyz.length
                    cartData.totalPrice = cartData.totalPrice + price
                    Obj = cartData
                    ab = false
                }
            }
            if (ab == true) {
                Obj = { $push: { items: { productId, quantity: 1 } }, $set: { totalPrice: price + cartData.totalPrice, totalItems: cartData.totalItems + 1 } }
            }
            CreateCart = await cartModel.findByIdAndUpdate(cartId, Obj, { new: true })
        }
        return res.status(201).send({ status: true, message: 'Success', data: CreateCart })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })

    }
}


const deleteCart = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Pls provide valid userId" })
        let cartData = await cartModel.findOne({ userId: userId }).select({ items: 1, totalItems: 1, totalPrice: 1, _id: 1 })
        if (!cartData) return res.status(404).send({ status: false, message: "cart  not exist" })
        cartData.items = []
        cartData.totalItems = 0
        cartData.totalPrice = 0

        //-----------------------Authorization-----------------//
        if (userId != req.userId) return res.status(403).send({ status: false, message: "Unauthorization error" })
        //----------------------------------------------------//

        let finall = await cartModel.findByIdAndUpdate(cartData.id, { $set: cartData }, { new: true })
        return res.status(200).send({ status: true, message: "success", data: finall })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
module.exports = { createCart, deleteCart }