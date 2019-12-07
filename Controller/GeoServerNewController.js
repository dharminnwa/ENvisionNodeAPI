var logger = require("../Helper/logs");
var config = require('config');
var http = require('http');
var querystring = require('querystring');
var geoserverHelper = require("../Helper/GeoServerHelper");
var WMSQueryPrama = require("../Helper/GetWMSQueryPrama");
var { TempHtml5_GeoMapProp } = require('../Models');
const request = require('request');

const GetGeoMapPost = (req, res, next) => {
    try {
        let bodyData = req.body;
        bodyData['version'] = "1.3.0";
        bodyData['request'] = "GetMap";
        bodyData['format'] = "image/png";
        bodyData['CRS'] = "EPSG:4326";
        bodyData['Service'] = "WMS";
        bodyData['width'] = "256";
        bodyData['height'] = "256";
        bodyData['TRANSPARENT'] = "true";
        bodyData["EXCEPTIONS"] = "INIMAGE";
        bodyData["isBaseLayer"] = "true";
        post_data = querystring.stringify(bodyData);
        var httpRequest = http.request({
            hostname: config.GEOServerRestApi.loadbalancerHostName,
            path: "/geoserver/BaseMaps/wms/",
            //port: 8080,
            method: 'POST',
            timeout: 120000000,
            headers: {
                'Content-Length': Buffer.byteLength(post_data),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        httpRequest.on('error', err => {
            logger.error("GeoServerNew", "GetGeoMapPost", err);
        });
        httpRequest.on('response', httpResponse => {
            var body = [];
            httpResponse.on('data', function (chunk) {
                body.push(chunk);
            });
            httpResponse.on('end', function () {
                var imgBuffer = Buffer.concat(body);
                var img = Buffer.from(imgBuffer, 'base64');
                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'Content-Length': img.length
                });
                res.end(img);
            });
        });
        httpRequest.write(post_data);
        httpRequest.end();

    } catch (err) {
        res.status(500)
        res.render('error', { error: err })
        logger.error("GeoServerNew", "GetGeoMapPost", err);
    }
}

const SetImageLayerData = (req, res, next) => {
    let param = req.body;
    param.SldBody = decodeURIComponent(param.SldBody);
    TempHtml5_GeoMapProp.save(param)
        .then(data => {
            if (data.length > 0)
                res.json({ _Issuccess: true, GeoMapPropID: data[0].GeoMapPropID });
        })
        .catch(next);
}

const GetGeoMapNew = (req, res, next) => {
    try {

        let query = req.query;
        let BBOX = query.BBOX;
        let geoMapID = query.GeoMapPropID;
        let zoom = query.Zoom;
        TempHtml5_GeoMapProp.find({ GeoMapPropID: geoMapID })
            .then(GeoMapProp => {
                if (GeoMapProp && GeoMapProp.length > 0) {
                    let bodyData = {};
                    let geoDataItem = GeoMapProp[0];

                    if (geoDataItem.ZoomData) {
                        // bodyData['SLD_BODY'] = geoDataItem.SldBody;
                        let splitSldBodyData = geoDataItem.SldBody.split(' ; ');
                        let splitZoomData = geoDataItem.ZoomData.split(';');
                        let indexesToRemove = [];
                        splitZoomData.forEach((item, index) => {
                            if (item != '') {
                                let splittedItem = item.split(',');
                                let minZoom = splittedItem[0];
                                let maxZoom = splittedItem[1];
                                if (!((zoom >= minZoom) && (zoom <= maxZoom))) {
                                    indexesToRemove.push(index);
                                }
                            }
                        });
                        let splitCQlFilter = geoDataItem.CqlFilter.split(';');
                        if (indexesToRemove.length > 0) {
                            indexesToRemove = indexesToRemove.reverse();
                            indexesToRemove.forEach(i => {
                                let indexToSplice = i + 1;
                                splitSldBodyData.splice(indexToSplice, 1);
                                splitCQlFilter.splice(i, 1);
                            })
                        }
                        geoDataItem.CqlFilter = '';
                        splitCQlFilter.forEach(cqlItem => {
                            if (geoDataItem.CqlFilter != '')
                                geoDataItem.CqlFilter += ';'
                            geoDataItem.CqlFilter += cqlItem;
                        })
                        bodyData['SLD_BODY'] = '';
                        if (splitSldBodyData.length == 2) {
                            res.status(200).send('');
                            return;
                        }
                        splitSldBodyData.forEach(item => {
                            bodyData['SLD_BODY'] += item;
                        })
                    } else {
                        bodyData['SLD_BODY'] = geoDataItem.SldBody;
                    }
                    if (geoDataItem.CqlFilter != '')
                        bodyData['CQL_FILTER'] = geoDataItem.CqlFilter;
                    bodyData['BBOX'] = BBOX;
                    bodyData['version'] = "1.3.0";
                    bodyData['request'] = "GetMap";
                    bodyData['format'] = "image/png";
                    bodyData['CRS'] = "EPSG:4326";
                    bodyData['Service'] = "WMS";
                    bodyData['width'] = "256";
                    bodyData['height'] = "256";
                    bodyData['TRANSPARENT'] = "true";
                    bodyData["EXCEPTIONS"] = "INIMAGE";
                    bodyData["isBaseLayer"] = "true";
                    post_data = querystring.stringify(bodyData);
                    var httpRequest = http.request({
                        hostname: config.GEOServerRestApi.loadbalancerHostName,
                        path: "/geoserver/BaseMaps/wms/",
                        //port: 8080,
                        method: 'POST',
                        timeout: 120000000,
                        headers: {
                            'Content-Length': Buffer.byteLength(post_data),
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });
                    httpRequest.on('error', err => {
                        logger.error("GeoServerNew", "GetGeoMapPost", err);
                    });
                    httpRequest.on('response', httpResponse => {
                        var body = [];
                        httpResponse.on('data', function (chunk) {
                            body.push(chunk);
                        });
                        httpResponse.on('end', function () {
                            var imgBuffer = Buffer.concat(body);
                            var img = Buffer.from(imgBuffer, 'base64');
                            res.writeHead(200, {
                                'Content-Type': 'image/png',
                                'Content-Length': img.length
                            });
                            res.end(img);
                        });
                    });
                    httpRequest.write(post_data);
                    httpRequest.end();
                } else {
                    res.status(200).send('');
                }
            })
            .catch(next);
    } catch (err) { logger.error("GeoServerNew", "GetGeoMapPost", err); }
}


const GetGeoDataNew = (req, res, next) => {
    try {
        let Body = WMSQueryPrama.CreateWFSBody(req.body);
        var wfsUrl = config.GEOServerUrl.wfsUrl;
        request.post(
            wfsUrl,
            {
                form: Body,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            },
            function (error, response, body) {
                if (response.body && response.body.indexOf('totalFeatures') >= 0) {
                    let resData = JSON.parse(response.body);
                    res.json(resData);
                } else {
                    res.json(response.body);
                }
            }
        );
    } catch (e) {
        console.log(e);
        res.status(404);
        res.end();
    }
}

const GetTotalCountListOfLayers = (req, res, next) => {
    geoserverHelper.GetTotalCountForLayers(req, res, next);
}

const GetParcelsLayersDataCountForSiteSelection = (req, res, next) => {
    try {
        let results = [];
        if (req.body.length == 2) {
            for (let reqBody of req.body) {
                let Body = WMSQueryPrama.CreateWFSBody(reqBody);
                var wfsUrl = config.GEOServerUrl.wfsUrl;
                request.post(
                    wfsUrl,
                    {
                        form: Body,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                    },
                    function (error, response, body) {
                        if (response.body && response.body.indexOf('totalFeatures') >= 0) {
                            let resData = JSON.parse(response.body);
                            results.push({ TabelName: reqBody.energyLayer.TableName, TotalFeature: resData.totalFeatures });
                            if (results.length == 2)
                                res.json(results);
                        }
                        else {
                            results.push({ TabelName: reqBody.energyLayer.TableName, TotalFeature: resData.totalFeatures });
                            if (results.length == 2)
                                res.json(results);
                        }
                    }
                );
            }
        }
    } catch (e) { console.log(e) }
}

const DeleteGeoImageTempProp = (req, res, next) => {
    let param = req.query;
    TempHtml5_GeoMapProp.hardDelete({ UserID: param.UserId })
        .then(data => {
            res.json({ _Issuccess: true });
        })
        .catch(next);
}

const GetFloodHazardTransparentLayer = (req, res, next) => {
    try {
        let URL = config.DotnetAPI.apiURL + 'IconGenerate/setopacityvalue?BBOx=' + req.query.BBOX + '&opacityvalue=' + req.query.opacityvalue;
        request(URL, { json: false }, (error, response, body) => {
            if (error || !body) {
                logger.error("Geoserver", "GetFloodHazardTransparentLayer", error);
            }
            var img = Buffer.from(body.replace(/"/g, ''), 'base64');
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': img.length
            });
            res.end(img);
        });
    } catch (e) { console.log(e) }
}

function BlankTempMapImageTable() {
    TempHtml5_GeoMapProp.hardDelete({}).then(data => {
        // console.log('Temp Table Cleared');
    }).catch(err => {
        console.log(err);
    });
}

module.exports = {
    GetGeoMapPost,
    SetImageLayerData,
    GetGeoMapNew,
    DeleteGeoImageTempProp,
    BlankTempMapImageTable,
    GetGeoDataNew,
    GetTotalCountListOfLayers,
    GetParcelsLayersDataCountForSiteSelection,
    GetFloodHazardTransparentLayer
};