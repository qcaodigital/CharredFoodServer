const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const ejs = require('ejs');

router.post('/contact-submit', (req, res) => {
	const data = req.body;
	ejs.renderFile(__dirname + '/index.ejs', { data: data }, function (err, ejs) {
		if (err) {
			console.log(err);
		} else {
			const transporter = nodemailer.createTransport({
				host: 'smtp.mailgun.org',
				port: 587,
				//MAILGUN ACCOUNT IS ZALEYA@GMAIL.COM
				auth: {
					user: process.env.SMTP_USER,
					pass: process.env.SMTP_PASS,
				},
			});

			const mailOptions = {
				from: 'info-noreply@charredfood.com',
				to: 'charredfood.contact@gmail.com',
				subject: `${data.subject.value} - from: ${data.firstname.value} ${data.lastname.value}`,
				html: ejs,
			};

			if (data.copy_recipient.value) {
				mailOptions = {
					...mailOptions,
					cc: data.email.value,
				};
			}

			transporter.sendMail(mailOptions, (err, info) => {
				if (err) {
					console.log(err);
				} else {
					console.log('Email sent:', info.response);
				}
			});

			res.send(data);
		}
	});
});

module.exports = router;
