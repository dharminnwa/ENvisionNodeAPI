var logger = require("../Helper/logs");
const { KnexRaw } = require('../Models');
const { KnexRawPG } = require('../Models/PostgreDb');
var UtilityJs = require('../Helper/Utility');
var WMSQueryPrama = require("../Helper/GetWMSQueryPrama");
var config = require('config');
const request = require('request');
module.exports =
    {
        GetTotalCountForLayers: function (request, response, next) {
            var JsonData = {
                _Issuccess: false,
                result: null,
                errorMsg: ''
            }
            let layerList = request.body.LayerList;
            let layerCountPromises = [];
            for (let layer of layerList) {
                let layerTotalCountRequestBody = {
                    energyLayer: layer.Layer,
                    startIndex: 0,
                    maxFeatures: 1,
                    CQL_FILTER: layer.TotalCountFilter,
                    sortBy: "",
                    bbox: "",
                    UserId: layer.UserID
                }
                let layerActiveCountRequestBody = {
                    energyLayer: layer.Layer,
                    startIndex: 0,
                    maxFeatures: 1,
                    CQL_FILTER: layer.ActiveCountFilter,
                    sortBy: "",
                    bbox: "",
                    UserId: layer.UserID
                }
                layerCountPromises.push(this.GetGeoDataNew(layerTotalCountRequestBody, "TotalCount", layer.TreeStatus, layer.ParentId));
                layerCountPromises.push(this.GetGeoDataNew(layerActiveCountRequestBody, "ActiveCount", layer.TreeStatus, layer.ParentId));
            }
            Promise.all(layerCountPromises).then(function (data) {
                JsonData._Issuccess = true;
                JsonData.result = data;
                response.json(JsonData);
            }, function (error) {
                JsonData.errorMsg = error;
                response.json(JsonData);
            });
        },

        GetGeoDataNew: function (requestBody, countType, treeStatus, parentId) {
            return new Promise((resolve, reject) => {
                try {
                    let Body = WMSQueryPrama.CreateWFSBody(requestBody);
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
                                let result = {
                                    CountType: countType,
                                    LayerId: requestBody.energyLayer.EnergyLayerID,
                                    TreeStatus: treeStatus,
                                    ParentId: parentId,
                                    Count: resData.totalFeatures
                                }
                                resolve(result);
                            } else {
                                reject(response.body);
                            }
                        }
                    );
                } catch (error) {
                    reject(error);
                }
            })
        }
    };
