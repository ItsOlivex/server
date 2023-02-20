const express = require("express");
const path = require('path');
const jsw = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const uaParser = require('ua-parser-js');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const requestIp = require('request-ip');
const geoip = require('geoip-lite');
const useragent = require('express-useragent');
const utility = require("./utility");
const JSW_SECRET = "super secret";

class Server {
  constructor() {
    this.app = express();
    this.port = 8080;
    this.utility = new utility();
    this.transport = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: "mirko.olivetti.f@outlook.it",
        pass: "Motocross2004"
      }
    })
  }

  config() {
    this.app.use(useragent.express());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    let time = 1000 * 60 * 60;
    this.app.use(session({
      secret: this.utility.generateRandomKey(48),
      saveUninitialized: true,
      cookie: { maxAge: time },
      resave: false
    }));
    this.app.listen(this.port, console.log("Listening on port " + this.port));
  }

  setStatic(path) {
    this.app.use(express.static(path));
  }

  verifyDevice(req, res, db, success, error) {
    const deviceId = req.cookies.deviceId;
    const userAgent = req.headers['user-agent'];
    const parsed = uaParser(userAgent);
    let vendor = parsed.device.vendor = null ? parsed.device.vendor : "Sconoscuto";
    let model = parsed.device.model = null ? parsed.device.model : "Sconoscuto";
    if (deviceId) {
      db.createQuery(db.queries.verifyDeviceKey, (result) => {
        if (success) {
          success();
        }
      }, () => { }, [deviceId]);
    } else {
      const secret = JSW_SECRET + model;
      const payload = {
        brand: vendor,
        model: model
      }
      const token = jsw.sign(payload, secret, { expiresIn: "15m" });
      const link = `http://localhost:8080/add-device/${payload.brand}/${payload.model}/${token}`;
      let detailsMail = {
        from: "mirko.olivetti.f@outlook.it",
        to: "mirko.olivetti.f@gmail.com",
        subject: "Verify device",
        text: link
      }
      this.transport.sendMail(detailsMail, (err) => {if (err) throw err});
      if(error) {
        error();
      }
    }
  }

  getJSW() {
    return jsw;
  }

  get(url, callback) {
    this.app.get(url, (req, res) => {
      callback(req, res);
    });
  }

  post(url, callback) {
    this.app.post(url, (req, res) => {
      callback(req, res);
    });
  }

  sessionSet(req, user) {
    req.session.idAccount = user[0].id;
    req.session.email = user[0].email;
    req.session.name = user[0].name;
    req.session.surname = user[0].surname;
    req.session.permission = user[0].permission;
    req.session.darkMode = user[0].darkMode;
  }

  geoloc(req) {
    return geoip.lookup(requestIp.getClientIp(req))
  }
}

module.exports = Server;