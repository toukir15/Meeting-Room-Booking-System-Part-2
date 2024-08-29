"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyBookingRouter = exports.BookingRouter = void 0;
const express_1 = __importDefault(require("express"));
const booking_controller_1 = require("./booking.controller");
const validateRequest_1 = require("../../middlewares/validateRequest");
const booking_validation_1 = require("./booking.validation");
const auth_1 = require("../../middlewares/auth");
const user_const_1 = require("../user/user.const");
const router = express_1.default.Router();
router.post('/', (0, auth_1.auth)(user_const_1.USER_ROLE.user), (0, validateRequest_1.validateRequest)(booking_validation_1.BookingValidations.createBookingValidationSchema), booking_controller_1.BookingControllers.createBooking);
router.put('/:id', (0, auth_1.auth)(user_const_1.USER_ROLE.admin), (0, validateRequest_1.validateRequest)(booking_validation_1.BookingValidations.updateBookingValidationSchema), booking_controller_1.BookingControllers.updateBooking);
router.delete('/:id', (0, auth_1.auth)(user_const_1.USER_ROLE.admin), (0, validateRequest_1.validateRequest)(booking_validation_1.BookingValidations.updateBookingValidationSchema), booking_controller_1.BookingControllers.deleteBooking);
exports.BookingRouter = router;
router.get('/', (0, auth_1.auth)(user_const_1.USER_ROLE.user), booking_controller_1.BookingControllers.getMyBookings);
exports.MyBookingRouter = router;
