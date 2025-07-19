const axios = require("axios");
const moment = require("moment");

const getAccessToken = async () => {
  const url =
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const res = await axios.get(url, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  return res.data.access_token;
};

exports.stkPush = async (req, res) => {
  try {
    const token = await getAccessToken();
    const timestamp = moment().format("YYYYMMDDHHmmss");

    const password = Buffer.from(
      process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
    ).toString("base64");

    const { phone, amount } = req.body;

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: "Techlink",
      TransactionDesc: "Payment for services",
    };

    const mpesaRes = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.status(200).json({ message: "Prompt sent", data: mpesaRes.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res
      .status(500)
      .json({
        message: "M-Pesa STK Push failed",
        error: error.response?.data || error.message,
      });
  }
};

exports.stkCallback = async (req, res) => {
  try {
    // Just acknowledge that the callback was received
    res.status(200).json({ message: "Callback received successfully" });
  } catch (error) {
    res.status(500).json({ message: "Callback processing failed" });
  }
};
