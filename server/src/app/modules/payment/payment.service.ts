import Stripe from 'stripe';
import { Slot } from '../slot/slot.model';
import { AppError } from '../../errors/appError';
import httpStatus from 'http-status';
import config from '../../config';
const stripe = new Stripe(config.stripe_cli as string);

interface BookingData {
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  email: string;
  phone: string;
  roomName: string;
  pricePerSlot: string;
  user: string;
  room: string;
}

const createPaymentSession = async (bookingData: BookingData) => {
  // find slot
  const findSlot = await Slot.findOne({
    date: bookingData.date,
    startTime: bookingData.startTime,
    endTime: bookingData.endTime,
  });

  const bookingCollectionData = {
    date: bookingData.date,
    slot: findSlot?._id,
    user: bookingData.user,
    room: bookingData.room,
  };

  if (!findSlot) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Slot not availabled');
  }

  // Step 1: Create a Product
  const product = await stripe.products.create({
    name: `Room Booking for ${bookingData.roomName}`,
    description: `Booking on ${bookingData.date} from ${bookingData.startTime} to ${bookingData.endTime}`,
  });
  // Step 2: Create a Price
  const price = await stripe.prices.create({
    unit_amount: Number(bookingData.pricePerSlot), // Update the amount as needed
    currency: 'usd',
    product: product.id,
  });
  // Step 3: Create a Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    customer_email: bookingData.email,
    metadata: {
      phone: bookingData.phone,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      slotId: String(findSlot._id),
      bookingData: JSON.stringify(bookingCollectionData),
    },
    success_url: `${config.client_url}/payment-success`,
    cancel_url: config.client_url,
  });
  return session;
};

export const PaymentService = {
  createPaymentSession,
};
