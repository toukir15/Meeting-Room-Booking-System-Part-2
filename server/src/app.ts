import express, { Application } from 'express';
import cors from 'cors';
import router from './app/routes';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import { notFound } from './app/middlewares/notFound';
import bodyParser from 'body-parser';
import Stripe from 'stripe';
import { Slot } from './app/modules/slot/slot.model';
import { AppError } from './app/errors/appError';
import httpStatus from 'http-status';
import { Booking } from './app/modules/booking/booking.model';
import config from './app/config';
const app: Application = express();
const stripe = new Stripe(config.stripe_cli as string);

app.use(cors({ origin: [config.client_url as string], credentials: true }));
app.use(express.urlencoded({ extended: true }));

// application routes
app.use('/api', express.json(), router);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe_endpoint_secret as string,
      );
    } catch (err) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Webhook Error');
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const bookingData = JSON.parse(session.metadata!.bookingData);
      const slotId = session.metadata!.slotId;

      try {
        // update slot status
        await Slot.findByIdAndUpdate(
          slotId,
          {
            isBooked: true,
          },
          { new: true },
        );

        // create booking
        if (bookingData) {
          await Booking.create(bookingData);
        }
      } catch (err) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Failed to find slot for booking ID ${slotId}:`,
        );
      }
    } else {
      console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  },
);

app.use(globalErrorHandler);

// Not found route
app.use(notFound);

export default app;
