require('dotenv').config();

const express = require('express'),
      app     = express(),
      nodemailer = require('nodemailer'),
      ejs     = require('ejs'),
      cors    = require('cors')

app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set('view engine', 'ejs');

app.post('/charredapi/contact-submit', (req, res) => {
    const date = new Date(Date.now())
    const data = req.body;

    console.log(data)

    ejs.renderFile(__dirname + '/index.ejs', { data: data }, function(err, ejs){
        if(err){
            console.log(err)
        } else {
            const transporter = nodemailer.createTransport({
                host: 'smtp.mailgun.org',
                port: 587,
                //MAILGUN ACCOUNT IS ZALEYA@GMAIL.COM
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            const mailOptions = {
                from: 'info-noreply@charredfood.com',
                to: 'charredfood.contact@gmail.com',
                subject: `${data.subject.value} - from: ${data.firstname.value} ${data.lastname.value}`,
                html: ejs
            }

            if(data.copy_recipient.value){
                mailOptions = {
                    ...mailOptions,
                    cc: data.email.value
                }
            }

            transporter.sendMail(mailOptions, (err, info) => {
                if(err){
                    // console.log(date.toString())
                    console.log(err)
                } else {
                    // console.log(date.toString())
                    console.log('Email sent:', info.response)
                }
            })

            res.send(data)
        }
    })
})

const port = process.env.PORT || 3001;
app.listen(port, (req, res) => {
    console.log(`Server started on port ${port}`)
})
