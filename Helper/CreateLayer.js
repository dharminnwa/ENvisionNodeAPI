var logger = require("../Helper/logs");
var SQLQueryPrama = require("./SqlQuery/LayerQuery");
const { KnexRaw } = require('../Models');
const { KnexRawPG } = require('../Models/PostgreDb');
var UtilityJs = require('../Helper/Utility');
module.exports =
    {
        GetPipelineWizardData: function (request, response, next) {
            var PipelineWizardData = {
                Commodities: [],
                Operators: [],
                Owners: [],
                Systems: [],
                errormsg: '',
                Body: request.body
            }
            var promises = [];
            var UserID = request.query.UserId;
            let query = SQLQueryPrama.GetPipelineWizardQuery();
            KnexRaw.raw(query).then(function (Data) {
                var sqlRes = Data;
                if (sqlRes.length > 0) {
                    var tableName = sqlRes[0]["TableName"];
                    let pgQuery = "select GetMetadataDistinctValues('" + tableName + "', 'COMMODITY', NULL, NULL)";
                    KnexRawPG.raw(pgQuery).then(data => {
                        if (data.rowCount > 0) {
                            let result = data.rows;
                            var commodities = result.map(a => a.getmetadatadistinctvalues);
                            let unknownIndex = commodities.findIndex(x => x == 'Unknown');
                            if (unknownIndex > -1)
                                commodities.splice(unknownIndex, 1);
                            var resultOfCommodities = { ResultOf: "Commodity Names", Data: commodities };
                            promises.push(resultOfCommodities);
                            for (var i = 0; i < commodities.length; i++) { //commodities.length
                                promises.push(GetOperartorsBasedOnComodity(tableName, commodities[i], next));
                                promises.push(GetOwnersBasedOnComodity(tableName, commodities[i], next));
                                promises.push(GetSystemsBasedOnComodity(tableName, commodities[i], next));
                            }
                            Promise.all(promises).then(function (data) {
                                if (data.length > 0) {
                                    var commodities = [];
                                    for (var i = 0; i < data.length; i++) {
                                        var e = data[i];
                                        if (e.ResultOf == "Commodity Names") {
                                            commodities.push(e);
                                            break;
                                        }
                                    }
                                    if (commodities.length > 0) {
                                        commodities[0].Data.forEach(function (commodityName, j) {
                                            let ListItem = {
                                                IsSelected: false,
                                                Name: '',
                                                OpConnections: [],
                                                OwConnections: [],
                                                SysConnections: []
                                            }
                                            ListItem.Name = commodityName;
                                            for (var i = 0; i < data.length; i++) {
                                                var e = data[i];
                                                if (e.ResultOf == "Operator" && e.ComodityName == commodityName) {
                                                    ListItem.OpConnections = e.Data;
                                                }
                                                if (e.ResultOf == "Owner" && e.ComodityName == commodityName) {
                                                    ListItem.OwConnections = e.Data;
                                                }
                                                if (e.ResultOf == "System" && e.ComodityName == commodityName) {
                                                    ListItem.SysConnections = e.Data;
                                                }
                                                if (ListItem.OpConnections.length > 0 && ListItem.OwConnections.length > 0 && ListItem.SysConnections.length > 0)
                                                    break;
                                            }
                                            PipelineWizardData.Commodities.push(ListItem);
                                            if (j == (commodities[0].Data.length - 1)) {
                                                PipelineWizardData.errormsg = "";
                                                response.json(PipelineWizardData);
                                            }
                                        });
                                    }

                                }
                            }).catch(function (error) {
                                PipelineWizardData.errormsg = error;
                                logger.error("GetPipelineWizardData", "CreateLayer", PipelineWizardData.errormsg);
                                UtilityJs.InserterrorExceptionLogs(request, UserID, PipelineWizardData.errormsg)
                                response.json(PipelineWizardData);
                            });
                        }
                    }).catch(function (error) {
                        UtilityJs.InserterrorExceptionLogs(request, UserID, error.originalError.message)
                        next(error);
                    });
                }
            }).catch(function (error) {
                UtilityJs.InserterrorExceptionLogs(request, UserID, error.originalError.message)
                next(error);
            });

        },
        GetRailWizardData: function (request, response, next) {
            var railWizardData = {
                Countries: [],
                Owners: [],
                errormsg: "",
                Body: request.body
            }
            var UserID = request.query.UserId;
            var promises = [];
            var countries = [];
            countries.push("Canada");
            countries.push("United States");
            for (var country of countries) {
                var tableName;
                if (country == "Canada") tableName = "ca_rail"; else tableName = "us_rail";
                promises.push(GetRailWizaedOwner(tableName, country, next));
            }
            Promise.all(promises).then(function (data) {
                railWizardData.Countries = data;
                railWizardData.errormsg = "";
                response.json(railWizardData);
            }).catch(function (error) {
                railWizardData.errormsg = error;
                logger.error("GetRailWizardData", "CreateLayer", railWizardData.errormsg);
                UtilityJs.InserterrorExceptionLogs(request, UserID, railWizardData.errormsg)
                response.json(railWizardData);
            });
        }
    };

function GetOperartorsBasedOnComodity(tableName, comodity, next) {
    //Operator
    var queryOfFilter = "select GetMetadataDistinctValues('" + tableName + "', 'OPERATOR', 'COMMODITY', '" + comodity + "')";
    return KnexRawPG.raw(queryOfFilter).then(data => {
        if (data.rowCount > 0) {
            let result = data.rows;
            let operator = result.map(a => a.getmetadatadistinctvalues);
            let resultsOfOperator = {
                ResultOf: 'Operator',
                ComodityName: comodity,
                Data: operator
            }
            return resultsOfOperator;
        }
    }).catch(next);
}

function GetOwnersBasedOnComodity(tableName, comodity, next) {
    //Owner
    var queryOfFilter = "select GetMetadataDistinctValues('" + tableName + "', 'OWNER', 'COMMODITY', '" + comodity + "')";
    return KnexRawPG.raw(queryOfFilter).then(data => {
        if (data.rowCount > 0) {
            let result = data.rows;
            let owner = result.map(a => a.getmetadatadistinctvalues);
            let resultsOfOwner = {
                ResultOf: 'Owner',
                ComodityName: comodity,
                Data: owner
            }
            return resultsOfOwner;
        }
    }).catch(next);
}

function GetSystemsBasedOnComodity(tableName, comodity, next) {
    //System
    var queryOfFilter = "select GetMetadataDistinctValues('" + tableName + "', 'SYSTEM', 'COMMODITY', '" + comodity + "')";
    return KnexRawPG.raw(queryOfFilter).then(data => {
        if (data.rowCount > 0) {
            let result = data.rows;
            let system = result.map(a => a.getmetadatadistinctvalues);
            let resultsOfSystem = {
                ResultOf: 'System',
                ComodityName: comodity,
                Data: system
            }
            return resultsOfSystem;
        }
    }).catch(next);
}

function GetRailWizaedOwner(tableName, country, next) {
    var query = "select GetMetadataDistinctValues('" + tableName + "', 'owner', NULL, NULL)";
    return KnexRawPG.raw(query).then(data => {
        if (data.rowCount > 0) {
            let result = data.rows;
            let owner = result.map(a => a.getmetadatadistinctvalues);
            let resultsOfOwner = {
                IsSelected: false,
                Name: country,
                OwConnections: owner
            }
            return resultsOfOwner;
        }
    }).catch(next);
}

