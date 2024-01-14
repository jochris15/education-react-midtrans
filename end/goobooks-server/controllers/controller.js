const axios = require('axios')
const { comparePassword } = require('../helpers/bcrypt')
const { createToken } = require('../helpers/jwt')
const { User, Order } = require('../models')
const midtransClient = require('midtrans-client');
const { nanoid } = require('nanoid')

class Controller {
    static async login(req, res, next) {
        try {
            const { username, password } = req.body

            if (!username || !password) {
                throw { name: "LoginError" }
            }

            const user = await User.findOne({
                where: { username: username }
            });

            if (!user) {
                throw { name: "LoginError" }
            }

            if (!comparePassword(password, user.password)) {
                throw { name: "LoginError" }
            }

            const payload = {
                id: user.id,
                username: user.username,
            }

            const access_token = createToken(payload)

            res.status(200).json({ access_token });
        } catch (err) {
            console.log(err);
            next(err)
        }
    }

    static async readBooks(req, res, next) {
        try {
            let { q } = req.query

            if (!q) {
                q = "harry"
            }

            const { data } = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${q}`)

            if (!data.items) throw { name: "NotFound" }

            const books = data.items.map((book) => {
                return {
                    id: book.id,
                    title: book.volumeInfo.title,
                    preview: book.volumeInfo.imageLinks?.thumbnail ? book.volumeInfo.imageLinks.thumbnail : 'no preview',
                    author: book.volumeInfo.authors ? book.volumeInfo.authors[0] : 'unknown',
                    rating: book.volumeInfo.averageRating ? book.volumeInfo.averageRating : 0
                }
            }).slice(0, 9)

            res.status(200).json(books)
        } catch (err) {
            console.log(err);
            next(err)
        }
    }

    static async readOrders(req, res, next) {
        try {
            const orders = await Order.findAll({
                where: {
                    userId: req.loginInfo.userId
                }
            })

            res.status(200).json(orders)
        } catch (err) {
            console.log(err);
            next(err)
        }
    }

    static async midtransToken(req, res, next) {
        try {
            // Create Snap API instance
            const bookPrice = 50000
            let snap = new midtransClient.Snap({
                // Set to true if you want Production Environment (accept real transaction).
                isProduction: false,
                serverKey: "SB-Mid-server-QYlwbcqsNuXCCh1Dl1z1lJE1"
            });

            const orderId = `trx-buy-${nanoid()}`

            await Order.create({
                orderId,
                userId: req.loginInfo.userId,
                amount: bookPrice
            })

            let parameter = {
                "transaction_details": {
                    "order_id": orderId,
                    "gross_amount": bookPrice
                },
                "credit_card": {
                    "secure": true
                },
                "customer_details": {
                    "username": req.loginInfo.username,
                }
            };

            const { token } = await snap.createTransaction(parameter)
            res.status(200).json({
                transaction_token: token,
                orderId
            })
        } catch (err) {
            console.log(err);
            next(err)
        }
    }

    static async updateOrderStatus(req, res, next) {
        try {
            const { orderId } = req.body
            // cari order bedasarkan order id
            const order = await Order.findOne({
                where: {
                    orderId
                }
            })

            if (!order) throw { name: "NotFound" }

            // abis itu check midtrans status ordernya
            const base64Key = Buffer.from(process.env.MIDTRANS_SERVER_KEY).toString('base64')
            const { data } = await axios.get(`https://api.sandbox.midtrans.com/v2/${orderId}/status`, {
                headers: {
                    Authorization: `Basic ${base64Key}`
                }
            })

            if (+data.status_code !== 200) {
                throw { name: "BadRequest" }
            }

            if (data.transaction_status !== 'capture') {
                throw { name: "BadRequest" }
            }
            // update order statusnya jadi paid
            await order.update({
                status: 'paid',
                paidDate: new Date()
            })

            res.status(200).json({
                message: 'Payment success!'
            })
        } catch (err) {
            console.log(err);
            next(err)
        }
    }
}

module.exports = Controller