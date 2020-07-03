const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');
const port = process.env.PORT || 3000;

paypal.configure({
  mode: 'sandbox', // sandbox or live
  client_id:
    'YOUR_CLIENT_ID',
  client_secret:
    'YOUR_CLIENT_SECRET',
});

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {
  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: 'Fidget Spinner',
              sku: '001',
              price: '20.00',
              currency: 'USD',
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: 'USD',
          total: '20.00',
        },
        description:
          'A fidget spinner , perfect toy for distarcting yourself at school, home & work!',
      },
    ],
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        // prettier-ignore
        if (payment.links[i].rel = 'approval_url') {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: 'USD',
          total: '20.00',
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
    if (error) {
      console.error(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.send('Successful Payment!');
    }
  });
});

app.get('/cancel', (req, res) =>
  res.send('Payment Cancelled - An Error Has Occurred!')
);

app.listen(port, () => console.log(`Server is running on port ${port}.`));
