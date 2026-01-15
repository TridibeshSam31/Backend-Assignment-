import express from "express"
import { authMiddleware } from "../middleware/authMiddleWare.js"
import { createBookingForLoginCustomer,deleteBooking,updateBooking,getBookings } from "../controllers/bookingController.js"

const bookingRouter = express.Router()

bookingRouter.post('/',authMiddleware,createBookingForLoginCustomer)
bookingRouter.get('/',authMiddleware,getBookings)
bookingRouter.put('/:bookingId',authMiddleware,updateBooking)
bookingRouter.delete('/:bookingId',authMiddleware,deleteBooking)

export default bookingRouter