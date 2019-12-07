var logger = require("../Helper/logs");
var FeedbackSQLQueryPrama = require("../Helper/SqlQuery/LayerQuery");
const { KnexRaw } = require('../Models');
var config = require('config');
var nodemailer = require('nodemailer');
var Utility = require('../Helper/Utility');
var CreateLogsHelper = require("../Helper/createLogs");
const FeedbackTest = (req, res, next) => {
    res.json(" Feedback Test successfully");
}
const SendFeedbackTomai = (req, res, next) => {
    let JsonData = {
        _Issuccess: false,
        Data: null,
        errormsg: ''
    }
    var Data = req.body;
    let Query = FeedbackSQLQueryPrama.GetCompnayNameByUserId(Data.UserId);
    KnexRaw.raw(Query).then(function (ResData) {
        if (ResData.length > 0) {
            Data.Company = ResData[0].CustomerName;
        }
        let ip = (req.headers['x-forwarded-for'] || '').split(',').pop() ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        Data.IP = ip;
        Data.Timestamp = Utility.getStringDateToMMDDYYWithtime(Data.Timestamp);
        let Host = "https://" + Data.Host;
        let DataIP = "http://" + Data.IP;
        var TestHTML = '<div>' +
            '<b>Timestamp: </b> ' + Data.Timestamp +
            '<br><b>Company: </b>' + Data.Company +
            '<br><b>User: </b>' + Data.User + ' <br> <b>Energy Layer:</b> ' + Data.EnergyLayer +
            '<br><b>DataSet: </b>' + Data.DataSet +
            '<br><b>Description: </b>' + Data.Description +
            '<br><b>Clicklocation: </b>' + Data.Clicklocation +
            '<br><b>ShapeName: </b>' + Data.ShapeName +
            '<br><b>Node sql id: </b>' + Data.NodeSqlId +
            '<br><b>MSID: </b>' + Data.MSID +
            '<br><b>Object id: </b>' + Data.ObjectId +
            '<br><b>Message: </b>' + Data.Message +
            '<div>' +
            '<br><b>Host: </b> <a href="' + Host + '" target="_blank">' + Host + '</a>' +
            '<br><b>IP: </b> <a href="' + DataIP + '" target="_blank">' + Data.IP + '</a>' +
            '</div>' +
            '</div>';
        var transporter = nodemailer.createTransport({
            service: config.NodeMailer.MailService,
            auth: {
                user: config.NodeMailer.FeedbackEmail.FeedbackFromUserId,
                pass: config.NodeMailer.FeedbackEmail.FeedbackFromPassword
            }
        });
        var mailOptions = {
            from: config.NodeMailer.FeedbackEmail.FeedbackFromUserId,
            to: config.NodeMailer.FeedbackEmail.FeebackToUserId,
            subject: 'Feedback',
            html: TestHTML
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                JsonData._Issuccess = false;
                JsonData.errormsg = error;
            } else {
                JsonData._Issuccess = true;
                JsonData.Data = 'Email sent: ' + info.response;
                try {
                    var Description = "Clicklocation: " + Data.Clicklocation + " ShapeName:" + Data.ShapeName + "  Node sql id: " + Data.NodeSqlId + " MSID: " + Data.MSID + " Object id: " + Data.ObjectId + " Message: " + Data.Message;
                    var UserGuid = Data.UserId;
                    var EnergyLayerGuid = Data.EnergyLayerGuid;
                    var Logtype = CreateLogsHelper.GetLogtype.Feedback;
                    CreateLogsHelper.createLogs(req, UserGuid, EnergyLayerGuid, null, Logtype, Description).then(function (data) {
                        logger.detaillog("Feedback Logs inserted successfully..");
                    }, function (error) {
                        logger.error("InfoboxFeedback", "Feedback", "Feedback logs not inserted successfully.." + error);
                    });
                } catch (error) { }
            }

            res.json(JsonData);
        });
    }).catch(function (error) {
        Utility.InserterrorExceptionLogs(req, Data.UserId, error.originalError.message)
    });

}

module.exports = {
    FeedbackTest,
    SendFeedbackTomai
}

