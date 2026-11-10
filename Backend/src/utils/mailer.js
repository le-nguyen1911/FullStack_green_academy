const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: Number(process.env.MAIL_PORT) === 465, 
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
});

transporter
  .verify()
  .then(() => console.log("SMTP connection successful"))
  .catch((e) => console.error("SMTP connection failed:", e.message));

const sendResetOTP = async (email, otp) => {
  const minutes = Number(process.env.RESET_OTP_EXPIRES_MINUTES || 10);
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Mã đặt lại mật khẩu",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Đặt lại mật khẩu</h2>
        <p>Mã xác minh của bạn là:</p>
        <h1 style="letter-spacing: 8px; color: #78350f;">${otp}</h1>
        <p>Mã có hiệu lực trong ${minutes} phút.</p>
        <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
      </div>`,
  });
};

module.exports = { sendResetOTP };
