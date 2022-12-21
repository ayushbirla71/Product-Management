const express = require('express')
const router = express.Router()
const link = require('../controllers/aws')
const { createUser,userLogin,UpdateUser, getUserProfile } = require('../controllers/userController')
const {createProduct, getProductByQuery, getProductById, deleteProductById}=require('../controllers/productController')


router.get("/test-me",function(req,res){
    res.send("This is the test Api!!!!!!!!!!!!!!")
})

//-------------------- user ------------------//
 router.post('/register', createUser)
router.post('/login',userLogin)
router.put('/user/:userId/profile',UpdateUser)
router.get('/user/:userId/profile', getUserProfile)

//------------------- Product ----------------//
router.post('/products',createProduct)
router.get('/products',getProductByQuery)
router.get('/products/:productId',getProductById)
router.delete('/products/:productId',deleteProductById)



module.exports = router