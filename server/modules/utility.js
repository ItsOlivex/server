const crypto = require('crypto');
const path = require('path');

class Utility {
	constructor() { }

	generateRandomKey(bit) {
		return crypto.randomBytes(bit).toString('hex');
	}

	join(dirname, directory) {
		return path.join(dirname, directory);
	}

	sessionCheck(req, res, callback) {
		if (req.session.name) {
			callback();
		} else {
			res.redirect("/login");
		}
	}

	permissionCheck(req, res, callback) {
		if (req.session.permission == 1) {
			callback();
		} else {
			res.redirect("/login");
		}
	}

	fileJson(files, dir, fs) {
		let result = { path: "", files: [] };
		result.path = dir;
		files.forEach((file) => {
			fs.lstatSync(dir + "/" + file).isDirectory() ? 
				result.files.push({ name: file, url: "folder-outline" }) : 
				result.files.push({ name: file, url: "document-outline" });
		});
		return result;
	}

}

module.exports = Utility;