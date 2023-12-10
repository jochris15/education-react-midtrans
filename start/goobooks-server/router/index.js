const router = require('express').Router();
const Controller = require('../controllers/controller')
const authentication = require('../middlewares/authentication')

router.post('/login', Controller.login)

router.use(authentication)

router.get('/books', Controller.readBooks)
router.get('/payment/midtrans', Controller.midtransToken)
router.get('/payment', Controller.readOrders)
router.patch('/payment/status', Controller.updateOrderStatus)

module.exports = router