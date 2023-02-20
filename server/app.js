const fs = require("fs");
const uaParser = require('ua-parser-js');
const serverModule = require("./modules/server");
const databaseModule = require("./modules/database");
const utilityModule = require("./modules/utility");
const app = new serverModule();
const db = new databaseModule();
const utility = new utilityModule();
const fileManager = "./fileManager/";

const JSW_SECRET = "super secret";


app.config();
app.setStatic(utility.join(__dirname, "/public"));

//login and profile section
app.get("/", (req, res) => {
	res.redirect("/login");
})

app.get("/login", (req, res) => {
	app.verifyDevice(req, res, db, () => {
		res.sendFile(utility.join(__dirname, "public/template/login.html"));
	}, () => {
		res.send("Dispositivo non concesso");
	});
});

app.get("/home", (req, res) => {
	utility.sessionCheck(req, res, () => {
		res.sendFile(utility.join(__dirname, "public/template/home.html"));
	});
});

app.get("/profile", (req, res) => {
	utility.sessionCheck(req, res, () => {
		let data = {
			name: req.session.name,
			surname: req.session.surname,
			email: req.session.email,
			darkMode: req.session.darkMode,
			permission: req.session.permission
		};
		res.send(data);
	})
});

app.post("/firstLog", (req, res) => {
	let email = req.body.email;
	let password = req.body.password;

	if (email && password) {
		db.createQuery(db.queries.selectMail, (resultsMail) => {
			db.createQuery(db.queries.selectMailPassword, (resultsUser) => {
				res.send({ status: "success" });
			}, () => {
				res.send({ status: "failure", message: null });
			}, [email, password]);
		}, () => {
			res.send({ status: "failure", message: "Account insesistente." });
		}, [email])
	}
});

app.post("/log", (req, res) => {
	let email = req.body.email;
	let password = req.body.password;

	if (email && password) {
		db.createQuery(db.queries.selectMailPassword, (results) => {
			let user = JSON.parse(JSON.stringify(results));
			app.sessionSet(req, user);
			let date = new Date();
			db.createQuery(db.queries.updateUserAccess, (results) => { }, () => {
				res.redirect("/home");
			}, [date, results[0].id]);
		}, () => {
			res.redirect("/login");
		}, [email, password]);
	} else {
		res.redirect("/login");
	}
});

app.post("/toggleDark", (req, res) => {
	utility.sessionCheck(req, res, () => {
		let mode = req.body.enable;
		db.createQuery(db.queries.toggleDarkMode, (result) => { }, (result) => {
			req.session.darkMode = mode;
			res.send(req.body);
		}, [mode, req.session.idAccount]);
	});
});
//end login and profile section


//file manager section
app.post("/getFolders", (req, res) => {
	utility.sessionCheck(req, res, () => {
		let rawDirectoryFolder = req.body.folders;
		let folderDirectory = fileManager + req.session.name;
		rawDirectoryFolder ? rawDirectoryFolder.forEach((folder) => {
			console.log(folder);
			folderDirectory += "/" + folder;
		}) : null;
		res.send(fs.readdirSync(folderDirectory));
	});
})

app.post("/getFiles", (req, res) => {
	utility.sessionCheck(req, res, () => {
		if (req.body.path) {
			let filesName = fs.readdirSync(req.body.path);
			res.send(utility.fileJson(filesName, req.body.path, fs));
		} else if (req.body.folder) {
			let rawDirectoryFolder = req.body.folder;
			let fileDirectory = fileManager + req.session.name;
			rawDirectoryFolder ? rawDirectoryFolder.forEach((folder) => {
				fileDirectory += "/" + folder;
			}) : null;
			let filesName = fs.readdirSync(fileDirectory);
			res.send(utility.fileJson(filesName, fileDirectory, fs));
		}
	});
});

app.post("/deleteFolder", (req, res) => {
	utility.sessionCheck(req, res, () => {
		let folderName = req.body.folderName;
		fs.rm(fileManager + req.session.name + "/" + folderName, { recursive: true }, err => {
			if (err) throw err;
			res.send(fs.readdirSync(fileManager + req.session.name));
		});
	});
});

app.post("/createFolder", (req, res) => {
	utility.sessionCheck(req, res, () => {
		let folderName = req.body.folderName;
		let newFolder = fileManager + req.session.name + "/" + folderName;
		if (!fs.existsSync(newFolder)) {
			fs.mkdirSync(newFolder);
			res.send(fs.readdirSync(fileManager + req.session.name));
		} else {
			res.send({ status: "exists" });
		}
	});
});

app.post("/createFile", (req, res) => {
	utility.sessionCheck(req, res, () => {
		let fileName = req.body.fileName;
		let filePath = req.body.path;
		if (!fs.existsSync(filePath + "/" + fileName)) {
			if (fileName.includes(".")){
				let file = fs.writeFile(filePath + "/" + fileName, "", () => {
					let filesName = fs.readdirSync(req.body.path);
					res.send(utility.fileJson(filesName, req.body.path, fs));
				});
			}
		} else {
			res.send({ error: "not valid" });
		}
	});
});

app.post("/createNewFolder", (req, res) => {
	utility.sessionCheck(req, res, () => {
		let folderName = req.body.folderName;
		let folderPath = req.body.path;
		if (!fs.existsSync(folderPath + "/" + folderName)) {
			fs.mkdirSync(folderPath + "/" + folderName, { recursive: true });
			let filesName = fs.readdirSync(req.body.path);
			res.send(utility.fileJson(filesName, req.body.path, fs));
		}else {
			res.send({ error: "not valid" });
		}
	});
});
//end file manager section


//accounts manager section
app.get("/accounts", (req, res) => {
	utility.sessionCheck(req, res, () => {
		utility.permissionCheck(req, res, () => {
			db.createQuery(db.queries.selectAccounts, (accounts) => {
				res.send(JSON.parse(JSON.stringify(accounts)));
			}, () => { });
		});
	});
});
//end account manager section


//verify and add device
app.get("/add-device/:brand/:model/:token", (req, res) => {
	let { brand, model, token } = req.params;
	const userAgent = req.headers['user-agent'];
	const parsed = uaParser(userAgent);
	brand = parsed.device.vendor = null ? parsed.device.vendor : "Sconoscuto";
	model = parsed.device.model = null ? parsed.device.model : "Sconoscuto";
	if(!req.cookies.deviceId) {
		const parsed = uaParser(req.headers['user-agent']);
		let secret = JSW_SECRET + model;
		try {
			const payload = app.getJSW().verify(token, secret);
			const key = utility.generateRandomKey(8);
			db.createQuery(db.queries.addDevice, (result) => { }, () => {
				res.cookie("deviceId", key, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true }).send("added");
			}, [key, brand, model]);
		} catch (error) {
			res.send("Link not valid");
		}
	} else {
		res.send("Alredy virified");
	}
});
//end verify and add device


app.post("/logout", (req, res) => {
	utility.sessionCheck(req, res, () => {
		res.redirect("/login");
		req.session.destroy();
	});
});