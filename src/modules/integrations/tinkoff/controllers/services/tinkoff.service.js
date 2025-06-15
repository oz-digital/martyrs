import axios from 'axios';
import crypto from 'crypto';
var TerminalKey = process.env.TINKOFF_TERMINAL_KEY;
var TerminalPassword = process.env.TINKOFF_TERMINAL_PASSWORD;
const controllerFactory = db => {
  const Payment = db.payment;
  const Order = db.order;
  function createToken(request) {
    request = Object.entries(request).map(function (key) {
      return { [key[0]]: key[1] };
    });
    request.push({ Password: TerminalPassword });
    request.sort(function (a, b) {
      if (Object.keys(a)[0] < Object.keys(b)[0]) {
        return -1;
      }
      if (Object.keys(a)[0] > Object.keys(b)[0]) {
        return 1;
      }
      return 0;
    });
    const requestContacted = request
      .map(function (key) {
        return Object.values(key)[0];
      })
      .join('');
    const hash = crypto.createHash('sha256').update(requestContacted).digest('hex');
    return hash;
  }
  const newpayment = (req, res) => {
    // Data for payment init
    console.log(req.body.phone);
    // Send request to Tinkoff
    axios
      .post('https://securepay.tinkoff.ru/v2/Init', {
        TerminalKey: TerminalKey,
        Amount: '350000',
        OrderId: req.body._id,
        Recurrent: 'y',
        PayType: 'О',
        CustomerKey: req.body.phone,
        Description: 'Оплата в интернет-магазине',
        Data: {
          phone: req.body.phone,
        },
        // SuccessURL: 'http://tandem.ohmybike.ru/rent/' + OrderId,
        // FailURL: 'http://tandem.ohmybike.ru/account'
        // SuccessURL: 'http://localhost:8082/rent/' + OrderId,
        // FailURL: 'http://localhost:8082/account'
      })
      .then(function (response) {
        const payment = new Payment(response.data);
        payment.save((err, payment) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          payment.save(err => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            res.send(response.data);
          });
        });
      })
      .catch(function (error) {
        res.send(error);
      });
  };
  const setpayment = (req, res) => {
    // Data for payment
    const payment = new Payment({
      OrderId: req.body.OrderId,
      Success: req.body.Success,
      Status: req.body.Status,
      PaymentId: req.body.PaymentId,
      ErrorCode: req.body.ErrorCode,
      Message: req.body.Message,
      Details: req.body.Details,
    });
    // Wright to db
    console.log(payment);
    payment.save((err, payment) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      payment.save(err => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        res.send({ message: 'Payment was created successfully!' });
      });
    });
  };
  const getstatus = (req, res) => {
    console.log(req.body.order);
    Payment.findOne({
      OrderId: req.body.order,
    })
      .sort({ createdAt: -1 })
      .exec((err, payment) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        if (!payment) {
          return res.status(404).send({ message: 'Payment Not found.' });
        }
        if (payment.Status === 'CONFIRMED') {
          console.log(payment.Status);
          console.log(req.body.order);
          Order.findOneAndUpdate({ _id: req.body.order, status: 'Подтвержден' }, { $set: { status: 'Ожидает отправки' } }, { new: true }).catch(function (error) {
            res.status(500).send(error);
          });
        }
        axios
          .post('https://securepay.tinkoff.ru/v2/GetState', {
            TerminalKey: TerminalKey,
            PaymentId: payment.PaymentId,
            Token: createToken({ TerminalKey: TerminalKey, PaymentId: payment.PaymentId }),
          })
          .then(function (response) {
            payment.Status = response.data.Status;
            payment.save();
            res.send(response.data);
          })
          .catch(function (error) {
            res.status(500).send(error);
          });
      });
  };
  const addcustomer = (req, res) => {
    console.log(req.body);
    axios
      .post('https://securepay.tinkoff.ru/v2/AddCustomer', {
        TerminalKey: TerminalKey,
        CustomerKey: req.body,
        Token: createToken({ TerminalKey: TerminalKey, CustomerKey: req.body.phone }),
      })
      .then(function (response) {
        res.send(response.data);
      })
      .catch(function (error) {
        res.status(500).send(error);
      });
  };
  const getcustomercards = (req, res) => {
    axios
      .post('https://securepay.tinkoff.ru/v2/GetCardList', {
        TerminalKey: TerminalKey,
        CustomerKey: req.body.phone,
        Token: createToken({ TerminalKey: TerminalKey, CustomerKey: req.body.phone }),
      })
      .then(function (response) {
        console.log(response.data);
        res.send(response.data);
      })
      .catch(function (error) {
        res.status(500).send(error);
      });
  };
  return {
    getAll,
    create,
    get,
    update,
    delete: deletePayment,
    createToken,
    newpayment,
    setpayment,
    getstatus,
    addcustomer,
    getcustomercards,
  };
};
export default controllerFactory;
