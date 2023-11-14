const path = require("path")
const express = require("express")
const exphbs = require("express-handlebars")
const app = express()
const bodyParser = require("body-parser")
const port = 3000
const hostname = "127.0.0.1"
const mongoose = require("mongoose")
const expressSession = require("express-session")
const MongoStore = require("connect-mongo")
const methodOverride = require("method-override")
const helpers = require('handlebars-helpers');
const fileUpload = require("express-fileupload");
const moment = require('moment');
const dotenv = require("dotenv")
dotenv.config()
const openai = require("openai")
 



mongoose.set('strictQuery', false);

mongoose.connect(
    "mongodb+srv://alperentuna26:ormVStovLdVRQyUk@atuna.uqlxl3k.mongodb.net/learningManagement",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  
  app.use(fileUpload());
  
  app.use(
    expressSession({
      secret: "testotesto",
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl:
          "mongodb+srv://alperentuna26:ormVStovLdVRQyUk@atuna.uqlxl3k.mongodb.net/learningManagement",
      }),
    })
  );
  
// Flash - Message middleware
app.use((req, res, next) => {
    res.locals.sessionFlash = req.session.sessionFlash
    delete req.session.sessionFlash
    next()
})

app.use((req, res, next) => {
    res.locals.sessionFlash = req.session.sessionFlash
    delete req.session.sessionFlash
    next()
})

app.use(express.static("public"))
app.use(methodOverride('_method'))

const hbs = exphbs.create({
    helpers: {
        checkHour: function(a,b,total){
            let expect=(b-a)*60
            console.log(expect)
            console.log(total)
            if(expect==total){
                return true
            }
        },
        eqArray: function(arr,value){
            const teacherId = arr.map((teacher) => teacher._id.toString());
         if(teacherId.includes(value.toString())){
            return true;
         }
        },
        plus: function(a,b){
            return a+b
        },
        any: function() {
            let options = arguments[arguments.length - 1];
            let args = Array.prototype.slice.call(arguments, 0, -1);
            for (let i = 0; i < args.length; i++) {
                if (args[i]) {
                    if (options.fn) {
                        return options.fn(this);
                    } else {
                        return args[i];
                    }
                }
            }
            if (options.inverse) {
                return options.inverse(this);
            }
        },
        
        concat: function (str1, str2) {
            return str1 + str2;
        },
        times: function(n, block) {
            let accum = '';
            for (let i = 1; i <= n; ++i)
                accum += block.fn(i);
            return accum;
        },
        eqIds: function (id1, id2) {
            return id1.equals(id2);
        },
        eq: function (a, b) {
            return a === b;
        },
        eqWithTrue: function (a, b) {
            if(a==b)
            return true
        },
        add: function (value,addition){
            return parseInt(value) + parseInt(addition)
        },
        moment: function(date) {
            return moment(date).format("YYYY-MM-DD");
        },

    }
});

app.engine("handlebars", hbs.engine)
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const users = require("./routes/users")
const { group } = require("console")
app.use("/users", users)

app.use((req, res, next) => {
    if (req.session.userId) {
        const main = require("./routes/main")
        app.use("/", main)
        const course = require("./routes/course")
        app.use("/course",course)
        const form = require("./routes/form")
        app.use("/form", form)
        const report = require("./routes/report")
        app.use("/report", report)
    } else {
        res.redirect("/users/login")
    }
    next();
})
app.listen(process.env.PORT || 3000);
//app.listen(port, () => console.log(`Example app listening ${hostname}:${port}`))