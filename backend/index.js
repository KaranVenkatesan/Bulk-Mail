const express = require("express");
const cors = require("cors")
// Install Node Mailer...
const nodemailer = require('nodemailer');
// Install Mongoose...
const mongoose = require("mongoose")

const app = express()

app.use(cors())
app.use(express.json())

// Connection with Mongoose with DB

mongoose.connect("mongodb+srv://vkaran0915:2000@cluster0.zb8jg.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0").then(function () {
    console.log("Connected to DB")
}).catch(function () {
    console.log("Failed to Connect")
})

// creating Model ...

const creadential = mongoose.model("creadential", {}, "bulkmail")


app.post("/sendemail", function (req, res) {
    res.send("Express on Vercel")
    var msg = req.body.msg
    var emailList = req.body.emailList
    console.log(msg)

    creadential.find().then(function (data) {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: data[0].toJSON().user,
                pass: data[0].toJSON().pass,
            },
        });

        new Promise(async function (resolve, reject) {
            try {

                for (var i = 0; i < emailList.length; i++) {
                    await transporter.sendMail(
                        {

                            from: "v.karan0915@gmail.com",
                            to: emailList[i],
                            subject: "A Message from Bulk mail app",
                            text: msg
                        },

                    )
                    console.log("Email sent to :" + emailList[i])

                }
                resolve("Success")
            }
            catch (error) {
                reject("Failed")
            }


        }).then(function () {
            res.send(true)
        }).catch(function () {
            res.send(false)
        })

        // console.log(data[0].toJSON())
    }).catch(function (error) {
        console.log(error)
    })


})



app.listen(5000, function () {
    console.log("Server Started....")
})