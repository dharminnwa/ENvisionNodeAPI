var express = require('express');
var sql = require("mssql");
var pg = require('pg');
var config = require('config');
const sharp = require('sharp');
var fs = require("fs");
const path = require('path');

var conn = require("../connection/connect")();
var Researchconn = require("../connection/connectMapsearchData")();
var pool = require("../connection/connectPostgreSql");
var CreateLogsHelper = require("../Helper/createLogs");
var logger = require("../Helper/logs");
var xmlParser = require('xml2json');
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
//var localpath = "/Websites/EnvisionAngular-API/API/Images/EnvisionAngularUsersIcon";
var localpath = config.ImagePath.UploadExternalIcon;
module.exports =
    {
        ResearchExecuteQuery: async function (SQLQuery) {
            Researchconn.on('error', err => {
                // ... error handler y
                console.log('sql pool error connection.js', err);
            });
            try {
                if (!Researchconn.connected) {
                    await Researchconn.connect();
                }
                let result = await Researchconn.request();
                result = await Researchconn.query(SQLQuery);
                return result;
            } catch (err) { // stringify err to easily grab just the message
                let e = JSON.stringify(err, ["message", "arguments", "type", "name"]);
                return { error: JSON.parse(e).message };
            } finally {
                if (Researchconn.connected) {
                    Researchconn.close(); //closing connection after request is finished.
                }
            }
        },
        ExecuteQuery: async function (SQLQuery) {
            conn.on('error', err => {
                // ... error handler 
                console.log('sql pool error connection.js', err);
            });
            try {
                if (!conn.connected) {
                    await conn.connect();
                }
                let result = await conn.request();
                result = await conn.query(SQLQuery);
                return result;
            } catch (err) { // stringify err to easily grab just the message
                let e = JSON.stringify(err, ["message", "arguments", "type", "name"]);
                return { error: JSON.parse(e).message };
            } finally {
                if (conn.connected) {
                    conn.close(); //closing connection after request is finished.
                }
            }
        },
        ReturnJsonResult: function (JsonList, res) {
            return res.json(JsonList);
        },
        ReturnResult: function (JsonList, res) {
            return res.json(JsonList);
        },
        getDatewithAMPM: function () {
            let date = new Date();
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let day = date.getDate();
            let month = date.getMonth();
            let year = date.getFullYear();
            let second = date.getSeconds();
            let ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            let strTime = month + "/" + day + "/" + year + " " + hours + ':' + minutes + ':' + second + ' ' + ampm;
            return strTime;
        },
        getStringDateToMMDDYYWithtime: function (StringData) {
            let date = new Date(StringData);
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let day = date.getDate();
            let month = date.getMonth();
            let year = date.getFullYear();
            let second = date.getSeconds();
            let ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            let strTime = month + "/" + day + "/" + year + " " + hours + ':' + minutes + ':' + second + ' ' + ampm;
            return strTime;
        },
        GetExportDate: function () {
            let date = new Date();
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let day = date.getDate();
            let month = date.getMonth();
            let year = date.getFullYear();
            let second = date.getSeconds();
            let ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            let strTime = year + "-" + month + "-" + day + "T" + hours + minutes + second;
            return strTime;
        },
        GetMonth: function () {
            const d = new Date();
            return monthNames[d.getMonth()];
        },
        ResizeImage: function (base64Img, width, height) {
            var img = new Buffer(base64Img, 'base64');
            return sharp(img).resize(width, height).toBuffer();
        },
        CreateImage: function (Data) {
            let ImagePath = localpath;
            ImagePath += "/" + Data.UploadedBy;
            this.makeDirectoryByPath(ImagePath);
            ImagePath += "/" + Data.Id + ".png";
            fs.writeFile(ImagePath, Data.Icon, 'base64', (err) => {
                // throws an error, you could also catch it here
                if (err) throw err;
            });
        },
        makeDirectoryByPath: function (targetDir, { isRelativeToScript = false } = {}) {
            const sep = '/';
            const initDir = path.isAbsolute(targetDir) ? sep : '';
            const baseDir = isRelativeToScript ? __dirname : '.';

            return targetDir.split(sep).reduce((parentDir, childDir) => {
                const curDir = path.resolve(baseDir, parentDir, childDir);
                try {
                    fs.mkdirSync(curDir);
                } catch (err) {
                    if (err.code === 'EEXIST') { // curDir already exists!
                        return curDir;
                    }

                    // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
                    if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
                        throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
                    }

                    const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
                    if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
                        throw err; // Throw if it's just the last created dir.
                    }
                }

                return curDir;
            }, initDir);
        },
        DeleteExternalIconImage: function (Data, callback) {
            let ImagePath = localpath;
            ImagePath += "/" + Data.UserId + "/" + Data.filename.trim();
            const baseDir = '.';
            const curDir = path.resolve(baseDir, ImagePath)
            if (fs.existsSync(curDir)) {
                fs.unlink(curDir, callback);
            }
        },
        GetPostgresqlPool: function () {
            return pool;
        },
        GetDistinctValue: function (Data, Keyval) {
            var lookup = {};
            var items = Data;
            var result = [];

            for (var item, i = 0; item = items[i++];) {
                var name = item[Keyval];

                if (!(name in lookup)) {
                    lookup[name] = 1;
                    result.push(name);
                }
            }
            return result;
        },
        GetDefaultExternalIcon: function (externalId) {
            var URL = "";
            externalId = parseInt(externalId);
            switch (externalId) {
                case 53:
                case 55:
                case 56:
                case 88:
                case 89:
                case 90:
                case 91:
                case 92:
                case 93:
                case 94:
                case 95:
                case 96:
                case 97:
                case 98:
                case 99:
                case 103:
                case 105:
                case 107:
                case 113:
                    URL = config.ImagePath.externalImage + externalId + ".png";
                    break;
            }
            return URL;
        },
        GenerateGUID: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        ReplaceAll: function (str, term, replacement) {
            return str.replace(new RegExp(module.exports.escapeRegExp(term), 'g'), replacement);
        },

        escapeRegExp: function (string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        },
        InserterrorExceptionLogs: function (req, UserGuid, Description) {
            try {
                var UserGuid = UserGuid;
                var Logtype = CreateLogsHelper.GetLogtype.Exception;
                if (Description && UserGuid) {
                    CreateLogsHelper.createLogs(req, UserGuid, null, null, Logtype, Description).then(function (data) {
                        //logger.detaillog("User Login Logs inserted successfully..");
                        console.log("User Logs inserted successfully..")
                    }, function (error) {
                        logger.error("Utility", "Utility js ", "User not inserted successfully.." + error);
                    });
                }
            } catch (e) { console.log(e) }
        },
        CreateCqlFilterFromXML: function (LayerGridFilter) {
            for (var filter of LayerGridFilter) {
                var cqlFilter = "";
                var cqlFilter1 = "";
                var cqlFilter2 = "";
                let xmlFilter = filter.FilterSaveString;
                let xmltoJsonData = JSON.parse(xmlParser.toJson(xmlFilter));
                if (!this.isEmpty(xmltoJsonData)) {
                    if (this.isArray(xmltoJsonData.ArrayOfFilterSetting.FilterSetting)) {
                        for (var filterSetting of xmltoJsonData.ArrayOfFilterSetting.FilterSetting) {
                            let columnName = filterSetting.ColumnUniqueName;
                            if (this.isArray(filterSetting.SelectedDistinctValues["d3p1:anyType"])) {
                                for (var value of filterSetting.SelectedDistinctValues["d3p1:anyType"]) {
                                    if (value && columnName)
                                        cqlFilter += columnName + "#EQUAL#" + value["$t"] + "#OR#";
                                }
                                cqlFilter = cqlFilter.substring(0, cqlFilter.length - 4);
                                cqlFilter += ";";
                            }
                            else {
                                value = filterSetting.SelectedDistinctValues["d3p1:anyType"];
                                if (value && columnName) {
                                    cqlFilter += columnName + "#EQUAL#" + value["$t"];
                                    cqlFilter += ";";
                                }
                            }
                            if (filterSetting.Filter1["Operator"]) {
                                value = filterSetting.Filter1["Value"];
                                var Operatorname = this.GetOperator(filterSetting.Filter1["Operator"]);
                                if (value && columnName) {
                                    cqlFilter1 = columnName + Operatorname + value["$t"];

                                }
                            }
                            if (filterSetting.Filter2["Operator"]) {
                                value = filterSetting.Filter2["Value"];
                                var Operatorname = this.GetOperator(filterSetting.Filter2["Operator"]);
                                if (value && columnName) {
                                    cqlFilter2 = columnName + Operatorname + value["$t"];

                                }
                            }
                            if (filterSetting["FieldFilterLogicalOperator"] == "And") {
                                if (cqlFilter1 && cqlFilter2) {
                                    cqlFilter1 = cqlFilter1 + ";" + cqlFilter2;
                                }
                                else if (cqlFilter1 && !cqlFilter2) {
                                    cqlFilter1 = cqlFilter1;
                                }
                                else if (!cqlFilter1 && cqlFilter2) {
                                    cqlFilter1 = cqlFilter2;
                                }
                            } else {
                                if (cqlFilter1 && cqlFilter2) {
                                    cqlFilter1 = cqlFilter1 + "#OR#" + cqlFilter2;
                                }
                                else if (cqlFilter1 && !cqlFilter2) {
                                    cqlFilter1 = cqlFilter1;
                                }
                                else if (!cqlFilter1 && cqlFilter2) {
                                    cqlFilter1 = cqlFilter2;
                                }
                            }
                        }

                    }
                    else {
                        var filterSetting = xmltoJsonData.ArrayOfFilterSetting.FilterSetting;
                        let columnName = filterSetting.ColumnUniqueName;
                        if (this.isArray(filterSetting.SelectedDistinctValues["d3p1:anyType"])) {
                            for (var value of filterSetting.SelectedDistinctValues["d3p1:anyType"]) {
                                if (value && columnName)
                                    cqlFilter += columnName + "#EQUAL#" + value["$t"] + "#OR#";
                            }
                            cqlFilter = cqlFilter.substring(0, cqlFilter.length - 4);
                            cqlFilter += ";";
                        }
                        else {
                            value = filterSetting.SelectedDistinctValues["d3p1:anyType"];
                            if (value && columnName) {
                                cqlFilter += columnName + "#EQUAL#" + value["$t"];
                                cqlFilter += ";";
                            }
                        }
                        if (filterSetting.Filter1["Operator"]) {
                            value = filterSetting.Filter1["Value"];
                            var Operatorname = this.GetOperator(filterSetting.Filter1["Operator"]);
                            if (value && columnName) {
                                cqlFilter1 = columnName + Operatorname + value["$t"];

                            }
                        }
                        if (filterSetting.Filter2["Operator"]) {
                            value = filterSetting.Filter2["Value"];
                            var Operatorname = this.GetOperator(filterSetting.Filter2["Operator"]);
                            if (value && columnName) {
                                cqlFilter2 = columnName + Operatorname + value["$t"];

                            }
                        }
                        if (filterSetting["FieldFilterLogicalOperator"] == "And") {
                            if (cqlFilter1 && cqlFilter2) {
                                cqlFilter1 = cqlFilter1 + ";" + cqlFilter2;
                            }
                            else if (cqlFilter1 && !cqlFilter2) {
                                cqlFilter1 = cqlFilter1;
                            }
                            else if (!cqlFilter1 && cqlFilter2) {
                                cqlFilter1 = cqlFilter2;
                            }
                        } else {
                            if (cqlFilter1 && cqlFilter2) {
                                cqlFilter1 = cqlFilter1 + "#OR#" + cqlFilter2;
                            }
                            else if (cqlFilter1 && !cqlFilter2) {
                                cqlFilter1 = cqlFilter1;
                            }
                            else if (!cqlFilter1 && cqlFilter2) {
                                cqlFilter1 = cqlFilter2;
                            }

                        }
                    }
                    if (cqlFilter1) {
                        cqlFilter += cqlFilter1;
                    } else {
                        cqlFilter = cqlFilter.substring(0, cqlFilter.length - 1);
                    }
                    if (!filter["cqlFilter"])
                        filter["cqlFilter"] = cqlFilter;
                }
            }
        },

        isArray: function (a) {
            return (!!a) && (a.constructor === Array);
        },

        isEmpty: function (myObject) {
            for (var key in myObject) {
                if (myObject.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        },
        GetOperator: function (Operator) {
            var value = "";
            switch (Operator) {
                case "Contains":
                    value = "#LIKE#"
                    break;
                case "IsEqualTo":
                    value = "#EQUAL#"
                    break;
                case "IsNotEqualTo":
                    value = "#NOTEQUAL#"
                    break;
                case "IsLessThan":
                    value = "<"
                    break;
                case "IsLessThanOrEqualToo":
                    value = "<="
                    break;
                case "IsGreaterThan":
                    value = ">"
                    break;
                case "IsGreaterThanOrEqualTo":
                    value = ">="
                    break;
            }
            return value;
        }


    };
