const axios = require('axios')
const { comparePassword } = require('../helpers/bcrypt')
const { createToken } = require('../helpers/jwt')
const { User, Order } = require('../models')

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
            // bikin token untuk identifikasi order di midtrans
        } catch (err) {
            console.log(err);
            next(err)
        }
    }

    static async updateOrderStatus(req, res, next) {
        try {
            // ambil orderId dari req.body
            // cari order bedasarkan order id
            // ubah server key jadi base64
            // abis itu check midtrans status ordernya
            // handle error kalo status codenya gak 200
            // handle error kalo transaction statusnya gak capture
            // update order statusnya jadi paid
        } catch (err) {
            console.log(err);
            next(err)
        }
    }
}

module.exports = Controller