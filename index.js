const express = require("express");
const bodyParser = require("body-parser");
const nodeMailer = require("nodemailer");
const config = require("./config.js");
var path = require("path");
const app = express();
app.use(express.static(path.join(__dirname)));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.post("/api/form", function (req, res) {
  nodeMailer.createTestAccount((err, account) => {
    const htmlEmail = `
      <h3>Contact Details</h3>
      <ul>
        <li>Name: ${req.body.name}</li>
        <li>Email: ${req.body.email}</li>
        <li>Phone: ${req.body.phone}</li>
      </ul>
      <h3>Subject: ${req.body.subject}</h3>
      <p>
        ${req.body.message}
      </P>
    `;
    let transporter = nodeMailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 587,
      auth: {
        user: "info@teampoker.com",
        pass: config.pass,
      },
    });

    let mailOptions = {
      from: `${req.body.email}`,
      to: "info@teampoker.com",
      replyTo: `${req.body.email}`,
      subject: `Contact from website - subject: ${req.body.subject}`,
      text: `New e-mail from ${req.body.name}`,
      html: htmlEmail,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return console.log(err);
      }
      res.end("sent");
      console.log("message sent.", info.message);
      console.log("message url", nodeMailer.getTestMessageUrl(info));
    });
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
