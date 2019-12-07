var Utility = require("../Helper/Utility");
var fs = require("fs");
var mkdirp = require('mkdirp');
var dir = './Logs/Error';


if (!fs.existsSync(dir)) {
    mkdirp(dir, function (err) {
        if (err) console.error(err)
        else {
            console.log("Logs dir had been created");
        }
    });
}
else {
    console.log("Logs dir already exists.");
}
module.exports =
    {
        error: function (router, controller, msg) {
            let dirname = "logs/error/";
            let month = Utility.GetMonth();
            let date = Utility.getDatewithAMPM();
            var now = new Date();
            let errorfilename = dirname + now.getDate() + month + now.getFullYear() + '.txt';
            let routername = date + ":- " + "Router:" + router + " Controller:" + controller + "\r\n";
            let message = date + ":- " + msg + "\r\n";
            let data = routername + message;
            writefile(errorfilename, data);
        },
        detaillog: function (msg) {
            let dirname = "logs/";
            let now = new Date();
            let month = Utility.GetMonth();
            let date = Utility.getDatewithAMPM();
            let detailfilename = dirname + now.getDate() + month + now.getFullYear() + '.txt';
            let message = date + ":- " + msg + "\r\n";
            writefile(detailfilename, message);
        },
        knexError: function (msg) {
            let dirname = "logs/error/";
            let month = Utility.GetMonth();
            let date = Utility.getDatewithAMPM();
            var now = new Date();
            let errorfilename = dirname + now.getDate() + month + now.getFullYear() + '.txt';
            let message = date + ":- " + msg + "\r\n";
            let data = message;
            writefile(errorfilename, data);
        }
    }

function writefile(FilePath, data) {
    if (!fs.existsSync(FilePath)) {
        fs.createWriteStream(FilePath);
        fs.writeFile(FilePath, data, (err) => {
            // throws an error, you could also catch it here
            if (err) throw err;
        });
    }
    else {
        fs.appendFile(FilePath, data, (err) => {
            if (err) throw err;
        });
    }
}
