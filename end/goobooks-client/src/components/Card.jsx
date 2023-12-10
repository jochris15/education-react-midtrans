import Rating from "react-rating"
import axios from 'axios';
import Swal from "sweetalert2";

export default function Card({ book, url }) {
    const config = {
        headers: {
            Authorization: `Bearer ${localStorage.access_token}`
        }
    }

    async function handleBuy() {
        try {
            const { data } = await axios(`${url}/payment/midtrans`, config)

            window.snap.pay(data.transaction_token, {
                onSuccess: async function () {
                    const response = await axios.patch(`${url}/payment/status`, { orderId: data.orderId }, config)
                    Swal.fire({
                        icon: "success",
                        title: response.data.message,
                    });
                },
                onPending: function () {
                    Swal.fire({
                        icon: "warning",
                        title: "Waiting your payment!",
                    });
                },
                onError: function () {
                    Swal.fire({
                        icon: "error",
                        title: "Payment failed!"
                    });
                },
                onClose: function () {
                    Swal.fire({
                        icon: "question",
                        title: "Cancel payment?",
                    });
                }
            })
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: error.response.data.message,
            });
        }
    }

    return (<>
        <div className="card bg-base-100 shadow-2xl flex flex-row">
            <figure>
                <img
                    className="p-4 w-full"
                    src={book.preview}
                    alt="book image"
                />
            </figure>
            <div className="card-body flex-1 justify-between">
                <b className="card-title">{book.title}</b>
                <div className="flex-1">{book.author}</div>
                <Rating
                    placeholderRating={book.rating}
                    placeholderSymbol="fa fa-star"
                    emptySymbol="fa fa-star-o"
                    fullSymbol="fa fa-star"
                />
                <div className="items-end">
                    <button onClick={handleBuy} className="btn btn-accent w-full">Buy this book</button>
                </div>
            </div>
        </div>
    </>)
}