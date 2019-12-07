const request = require('request');
var config = require('config');
var logger = require("../Helper/logs");
var QueryPrama = require("../Helper/GetQueryPrama");
var Auth = require("../Helper/Authentication");
var CreateLogsHelper = require("../Helper/createLogs");
var UserHelper = require("../Helper/User");
const UserLogin = (req, res, next) => {
    var JsonData = {
        UserName: '',
        token: "",
        responsedata: null,
        errormsg: '',
        IsAuthentication: config.IsTokanGenrate.Tokan
    }
    let URL = QueryPrama.CreateLoginURL(req.body);
    request(URL, { json: true }, (error, response, body) => {
        if (error) {
            logger.error("login", "Login", JSON.stringify(error));
            JsonData.UserName = null;
            JsonData.responsedata = null;
            JsonData.errormsg = error;
            res.json(JsonData);
        }
        else {
            logger.detaillog("Login Sucessfully...");
            let Userres = JSON.parse(response.body);
            let UserData = Userres.result;
            if (Userres.isSuccess == true && (UserData.IsApproved == true && UserData.IsUserLocked == false)) {
                var profile = {
                    username: req.body.username,
                    KeepmeLogin: req.body.KeepmeLogin
                };
                let hour = 1;
                if (profile.KeepmeLogin == true) {
                    UserData["KeepmeLogin"] = profile.KeepmeLogin;
                    hour = 120;
                }
                let Expiretime = (1 * hour) / 24 + 'd';
                var token = Auth.GenerateTokan(profile, Expiretime);
                if (JsonData.IsAuthentication) {
                    JsonData.token = token;
                } else {
                    JsonData.token = "";
                }
                JsonData.UserName = req.body.username;
                JsonData.responsedata = Userres;
                JsonData.errormsg = Userres.errorMessage;
                res.json(JsonData);
                logger.detaillog("Login successfully");
                if (Userres.isSuccess) {
                    var Description = Userres.result.UserName + " logged in.";
                    var UserGuid = Userres.result.UserGuid;
                    var Logtype = CreateLogsHelper.GetLogtype.Authentication;
                    CreateLogsHelper.createLogs(req, UserGuid, null, null, Logtype, Description).then(function (data) {
                        logger.detaillog("User Login Logs inserted successfully..");
                    }, function (error) {
                        logger.error("Login", "Login", "User Login not inserted successfully.." + error);
                    });

                }

            }
            else {
                JsonData.UserName = req.body.username;
                JsonData.responsedata = Userres;
                JsonData.errormsg = Userres.errorMessage;
                res.json(JsonData);
            }
        }
    });
}

const UserLogout = (req, res, next) => {
    let Userres = {
        isSuccess: true
    }
    var usertoken = "";
    if (req.headers['authorization'])
        usertoken = req.headers['authorization'];
    let URL = QueryPrama.CreateLogoutURL(req.body);
    request(URL, { json: true }, (error, response, body) => {        
        if (error) {
            logger.error("Logout", "Login", error);
        }
        else {
            logger.detaillog("Logout successfully");
            Userres = JSON.parse(response.body);
        }
        if (Userres.isSuccess && Userres.Username) {
            var Description = Userres.Username + " logged out..";
            var UserGuid = req.body.UserID;
            var Logtype = CreateLogsHelper.GetLogtype.Authentication;
            CreateLogsHelper.createLogs(req, UserGuid, null, null, Logtype, Description).then(function (data) {
                logger.detaillog("User Login Logs inserted successfully..");
            }, function (error) {
                logger.error("Login", "Login", "User Login not inserted successfully.." + error);
            });
        }
        if (usertoken) {
            Auth.blacklist(usertoken);
        }

        res.json(Userres);
    });
}

const ChangePassword = (req, res, next) => {
    var Change = req.body;
    if (Change.oldtext && Change.newtext) {
        var oldtextbuff = Buffer.from(Change.oldtext, 'base64').toString('ascii')
        var newtextbuff = Buffer.from(Change.newtext, 'base64').toString('ascii')
        let URL = QueryPrama.ChangePasswordURL(oldtextbuff, newtextbuff, Change.UserId);
        let Userres = {
            ErrorMessage: "Error occured during change!",
            IsSuccessful: false
        }
        request(URL, (error, response, body) => {
            if (error) {
                logger.error("ChangePassword", "Login", error);
            }
            else {
                logger.detaillog("Change Passowrd");
                Userres = JSON.parse(response.body);
            }
            try {
                if (Userres.IsSuccessful) {
                    var Description = "Change own password.";
                    var UserGuid = Change.UserId;
                    var Logtype = CreateLogsHelper.GetLogtype.PasswordChange;
                    CreateLogsHelper.createLogs(req, UserGuid, null, null, Logtype, Description).then(function (data) {
                        logger.detaillog("User Login Logs inserted successfully..");
                    }, function (error) {
                        logger.error("Login", "Login", "User Login not inserted successfully.." + error);
                    });
                }
            } catch (error) { }

            res.json(Userres);
        });
    } else {
        res.json(Userres);
    }
}

const GetUserRoles = (req, res, next) => {
    UserHelper.GetAllRoles(req, res, next);
}
module.exports = {
    UserLogin,
    UserLogout,
    ChangePassword,
    GetUserRoles
};

