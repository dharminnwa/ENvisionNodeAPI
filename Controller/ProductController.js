var sql = require("mssql");
var conn = require("../connection/connect")();
const crypto = require('crypto');
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
var logger = require("../Helper/logs");
function encrypt(text) {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
function getCategoryList() {
    try {
        var Data;
        conn.connect().then(function () {
            debugger
            var sqlQuery = "select * from Category where parentcategoryid is null  order by Ordernumber";
            var req = new sql.Request(conn);
            req.query(sqlQuery).then(function (recordset) {
                logger.detaillog("This Category record");
                logger.detaillog(JSON.stringify(recordset));
                Data = recordset;
                return Data;
                // res.json(recordset.recordset);

            }).catch(function (err) {
                logger.error("function getCategoryList", "Product", err);
                conn.close();
                // res.status(400).send("Error while inserting data");
            });
        })
            .catch(function (err) {
                conn.close();
                //res.status(400).send("Error while inserting data");
            });
    } catch (e) {
        conn.close();
        logger.error("function getCategoryList", "Product", e);
    }
}

const GetCategory = (req, res, next) => {
    conn.connect().then(function () {        
        var sqlQuery = "select * from Category where parentcategoryid is null  order by Ordernumber";
        var req = new sql.Request(conn);
        req.query(sqlQuery).then(function (recordset) {
            res.json(recordset);
            conn.close();
        }).catch(function (err) {
            conn.close();
            logger.error("Product controller", "Product", err);
            res.status(400).send("Error while inserting data");

        });
    })
        .catch(function (err) {
            conn.close();
            logger.error("Product controller", "Product", err);
            res.status(400).send("Error while inserting data");
        });  
}

module.exports = { GetCategory };