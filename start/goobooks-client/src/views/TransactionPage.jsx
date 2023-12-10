import Card from "../components/Card";
import axios from 'axios';
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import gearLoad from "./assets/Gear-0.2s-264px.svg"

export default function Home({ url }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false)

    const config = {
        headers: {
            Authorization: `Bearer ${localStorage.access_token}`
        }
    }

    async function fetchOrders() {
        try {
            setLoading(true)
            const { data } = await axios.get(`${url}/payment`, config);

            setOrders(data);
        } catch (error) {
            console.log(error);
            Swal.fire({
                icon: "error",
                title: error.response.data.message,
            });
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (orders.length == 0) {
        return (
            <div className="flex flex-col items-center">
                <b className="text-4xl text-accent mt-20"> You have no transaction</b>
                <div className="divider px-80"></div>
                <img src='https://y.yarn.co/e1d5bb0c-f5e6-4fa8-bec7-61a45ce09a91_text.gif' className="shadow-2xl w-1/2" />
                <div className="divider px-80"></div>
            </div >
        )
    }

    return (
        <>
            <div id="PAGE-HOME" className="p-3">
                {loading ? (
                    <div className="mt-32 flex justify-center items-center">
                        <img src={gearLoad} />
                    </div>
                ) : (
                    <div className="overflow-x-auto p-10">
                        <table className="table">
                            {/* head */}
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Order ID</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Paid Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order, idx) => {
                                    return (
                                        <tr className="hover" key={order.id}>
                                            <td>{idx + 1}</td>
                                            <td>{order.orderId}</td>
                                            <td>{order.amount}</td>
                                            <td>{order.status}</td>
                                            <td>{order.paidDate ? new Date(order.paidDate).toLocaleDateString("id") : "-"}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div >
        </>
    )
}