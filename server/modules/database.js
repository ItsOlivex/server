const mysql = require("mysql2");

class Database {


	queries = {
		selectMail: "SELECT * FROM users WHERE email = ?",
		selectMailPassword: "SELECT * FROM users WHERE email = ? AND password = ?",
		selectCookieInfo: "SELECT * FROM users WHERE usarName = ?",
		updateUserInfo: "UPDATE users SET lastAccess = ? AND lastLocation = ? WHERE id = ?",
		updateUserAccess: "UPDATE users SET lastAccess = ? WHERE id = ?",
		insert: "",
		toggleDarkMode: "UPDATE users SET darkMode =? WHERE id =?;",
		selectAccounts: "SELECT * FROM users",
		verifyDeviceKey: "SELECT * FROM devices WHERE uniquekey = ?",
		verifyDevice: "SELECT * FROM devices WHERE AND brand = ? AND model = ?",
		addDevice: "INSERT INTO devices (uniquekey, brand, model) VALUES (?, ?, ?)",
	}


	constructor() {
		this.db = mysql.createConnection({
			connectionLimit : 5000,
			host: "sql7.freesqldatabase.com",
			user: "sql7597289",
			password: "wYf5lLU5A9",
			database: "sql7597289"
		});
		this.db.connect((err) => {
			if (err) throw err
			console.log("Connected");
		});
	}

	createQuery(query, callback, errorCallback, arrayItem) {
		if (arrayItem) {
			this.db.query(query, arrayItem, (err, results, field) => {
				if (err) throw err;
				if (results.length > 0) {
					if (callback) {
						callback(results);
					}
				} else {
					if (errorCallback) {
						errorCallback();
					}
				}
			});
		} else if (!arrayItem) {
			this.db.query(query, (err, results, field) => {
				if (err) throw err;
				if (results.length > 0) {
					if (callback) {
						callback(results);
					}
				} else {
					if (errorCallback) {
						errorCallback();
					}
				}
			});
		}
	}

}

module.exports = Database;