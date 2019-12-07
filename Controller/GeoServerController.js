var WMSQueryPrama = require("../Helper/GetWMSQueryPrama");
const request = require('request');
var requestImage = require('request').defaults({ encoding: null });
var logger = require("../Helper/logs");
var CreateLogsHelper = require("../Helper/createLogs");
var Utilityjs = require("../Helper/Utility");
const { KnexRawPG } = require('../Models/PostgreDb');
const { InfoboxNotes } = require('../Models');
const TestGeoServer = (req, res, next) => {
    logger.detaillog("", "Geoserver", "GeoServer Request successfully");
    res.json("GeoServer Request successfully");
}
const InfoHelper = require('../Helper/InfoboxNotesHelper');

const GetInfoBoxData = (req, res, next) => {
    try {
        let URL = WMSQueryPrama.WFSGetInfoboxURL(req.body);
        request(URL, { json: true }, (error, responce, body) => {
            if (error || responce.body["totalFeatures"] == undefined) {
                logger.error("Geoserver", "GetInfoboxData", error);
                Utilityjs.InserterrorExceptionLogs(req, req.body.UserId, responce.body)
            }
            if (responce.body["totalFeatures"] && responce.body["totalFeatures"] > 0 && responce.body["features"] && responce.body["features"].length > 0) {
                var promises = [];
                for (let i = 0; i < responce.body.features.length; i++) {
                    let featureItem = responce.body.features[i];
                    promises.push(InfoHelper.SetNotesToInfoRequest(req, featureItem));
                }
                Promise.all(promises).then(function (InfoDataFeatures) {
                    responce.body.features = InfoDataFeatures;
                    res.json(responce.body);
                }, function (error) {
                    res.json(responce.body);
                    console.log(error);
                });

            } else {
                res.json(responce.body);
            }
        });
    } catch (e) {
        console.log(e);
    }
}

const GetPrivateLayerData = (req, res, next) => {
    try {
        let URL = WMSQueryPrama.WFSPrivateLayerData(req.body);
        request(URL, { json: true }, (error, responce, body) => {
            if (error || responce.body["totalFeatures"]) {
                logger.error("Geoserver", "GetPrivateLayerData", error);
                Utilityjs.InserterrorExceptionLogs(req, req.body.UserId, responce.body)
            }
            res.json(responce.body);
        });
    } catch (e) { console.log(e) }

}

const GetLayerFeatureType = (req, res, next) => {
    try {
        let URL = WMSQueryPrama.WFSGetFeaturetype(req.body);
        request(URL, { json: true }, (error, responce, body) => {
            if (error || !responce.body["featureTypes"]) {
                logger.error("Geoserver", "GetLayerFeaturetype", error);
                Utilityjs.InserterrorExceptionLogs(req, req.body.UserId, responce.body)
            }
            res.json(responce.body);
        });
    } catch (e) { console.log(e) }

}

const GetDatabasedOnPropertyName = (req, res, next) => {
    try {
        let URL = WMSQueryPrama.WFSGetLayerDatabasedonProp(req.body);
        request(URL, { json: true }, (error, responce, body) => {
            if (error) {
                logger.error("Geoserver", "GetDatabasedonPropertyname", error);
            }
            if (responce.body["features"]) {
                let ArrayData = []
                let Ldata = responce.body.features;
                for (let d of Ldata) {
                    ArrayData.push(d.properties)
                }
                let result = ArrayData.map(a => a[req.body.propertyName]);
                responce.body.features = getDistinctarray(result);
                res.json(responce.body);
            }
            else {
                res.json(responce.body);
            }
        });
    } catch (e) { console.log(e) }

}

const GetExportFeatureData = (req, res, next) => {
    try {
        let URL = WMSQueryPrama.WFSExportURL(req.body);
        request(URL, { json: true }, (error, responce, body) => {
            if (error || responce.body["totalFeatures"] == undefined) {
                logger.error("Geoserver", "GetExportFeatureData", error);
                Utilityjs.InserterrorExceptionLogs(req, req.body.UserID, responce.body);
            }
            else {
                var Description = req.body.Username + ", Export_wms_" + Utilityjs.GetExportDate() + ".xlsx";
                var UserGuid = req.body.UserID;
                var Logtype = CreateLogsHelper.GetLogtype.ExcelExport;
                CreateLogsHelper.createLogs(req, UserGuid, null, null, Logtype, Description).then(function (data) {
                    logger.detaillog("User Login Logs inserted successfully..");
                }, function (error) {
                    logger.error("Login", "Login", "User Login not inserted successfully.." + error);
                });
            }
            res.json(responce.body);
        });
    } catch (e) { console.log(e) }
}

const GetGeoData = (req, res, next) => {
    try {
        let URL = WMSQueryPrama.CreateWFSURL(req.body);
        request(URL, { json: true }, (error, responce, body) => {
            if (error || responce.body["totalFeatures"] == undefined) {
                logger.error("Geoserver", "GetGeoData", error);
                try {
                    // Utilityjs.InserterrorExceptionLogs(req, req.body.UserId, responce.body)
                } catch (e) { console.log(e) }
            }
            if (responce["body"]) {
                res.json(responce.body);
            }
            else {
                res.json(responce.body);
            }
        });
    } catch (e) { console.log(e) }
}

const GetGeoMap = (req, res, next) => {
    try {
        let URL = WMSQueryPrama.CreateWMStileURL(req.query);
        requestImage.get(URL, function (error, response, body) {
            if (error) {
                logger.error("Geoserver", "GetGeoData", error);
            }
            var img = new Buffer(body, 'base64');
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': img.length
            });
            res.end(img);
        });
    } catch (e) { console.log(e) }
}

const GetBasemap = (req, res, next) => {
    try {
        let URL = WMSQueryPrama.CreateWMSBaseMaptileURL(req.query);
        requestImage.get(URL, function (error, response, body) {
            if (error) {
                logger.error("Geoserver", "GetBasemap", error);
                res.status(404);
                res.end();
                return;
            }
            var img = new Buffer(body, 'base64');
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': img.length
            });
            res.end(img);
        });
    } catch (e) { console.log(e) }
}

const GetGeoMapTest = (req, res, next) => {
    var data = {
        SLD_BODY: "%3CStyledLayerDescriptor%20xmlns%3D%22http%3A%2F%2Fwww.opengis.net%2Fsld%22%3E%3CNamedLayer%3E%3CName%3Expipelines2019_01%3C%2FName%3E%3CUserStyle%3E%3CFeatureTypeStyle%3E%3CRule%3E%20%3CLineSymbolizer%3E%3CStroke%3E%3CCssParameter%20name%3D%22stroke%22%3E%23FF0000%3C%2FCssParameter%3E%3CCssParameter%20name%3D%22stroke-width%22%3E1.8%3C%2FCssParameter%3E%3CCssParameter%20name%3D%22stroke-opacity%22%3E1%3C%2FCssParameter%3E%3C%2FStroke%3E%3C%2FLineSymbolizer%3E%3C%2FRule%3E%3C%2FFeatureTypeStyle%3E%3C%2FUserStyle%3E%3C%2FNamedLayer%3E%3C%2FStyledLayerDescriptor%3E",
        version: "1.3.0",
        TILED: true,
        EXCEPTIONS: "INIMAGE",
        Service: "WMS",
        request: "GetMap",
        format: 'image%2Fpng',
        CRS: "EPSG:4326",
        bbox: {
            minx: 31.95216223802497,
            miny: -101.25,
            maxx: 40.979898069620134,
            maxy: -90
        },
        width: 256,
        height: 256,
        isBaseLayer: true,
        TRANSPARENT: true,
        CQL_FILTER: "(%20(COMMODITY%20=%20%27Crude%20Oil%27))"
    }
    var stream = wms.getMap(data, function (err, image) {
        if (err) {
            return false;
        }
        res.send(image);
    });
}

const GetUniqueData = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        UniqueData: null,
        errormsg: ""
    }
    let TableName = req.query.TableName;
    let ColumnName = req.query.ColumnName;
    let pgQuery = WMSQueryPrama.GetTableColumns(TableName);
    KnexRawPG.raw(pgQuery).then(data => {
        if (data.rowCount > 0) {
            for (let i = 0; i < data.rows.length; i++) {
                let Columns = data.rows[i].column_name;
                if (Columns.toLowerCase() == ColumnName.toLowerCase()) {
                    //let distinctquery = WMSQueryPrama.GetDistinctData(TableName, Columns);
                    let distinctquery = "select GetMetadataDistinctValues('" + TableName + "','" + Columns + "',Null,Null) as " + Columns;
                    KnexRawPG.raw(distinctquery).then(distinctdata => {
                        if (distinctdata.rowCount > 0) {
                            JsonData._Issuccess = true;
                            let arrayList = [];
                            for (let j = 0; j < distinctdata.rowCount; j++) {
                                arrayList.push(distinctdata.rows[0][Columns]);
                            }

                            JsonData.UniqueData = arrayList;
                        }
                    });
                }
            }
            res.json(JsonData);
        }

    }).catch(next);
}

function getDistinctarray(result) {
    var arr = [];
    for (var i = 0; i < result.length; i++) {
        if (result[i] != undefined && result[i] != null) {
            if (!arr.includes(result[i])) {
                arr.push(result[i]);
            }
        }
    }
    return arr;
}


module.exports = {
    TestGeoServer,
    GetInfoBoxData,
    GetPrivateLayerData,
    GetLayerFeatureType,
    GetDatabasedOnPropertyName,
    GetExportFeatureData,
    GetGeoData,
    GetGeoMap,
    GetBasemap,
    GetGeoMapTest,
    GetUniqueData
};