var logger = require("../Helper/logs");
var SQLQueryPrama = require("../Helper/SqlQuery/LayerQuery");
const { KnexRaw } = require('../Models');

const TestSharedDataRoutes = (req, res, next) => {
    logger.detaillog("SharedData Call Controller successfully");
    res.json("SharedData Call successfully");
}

const GetSharedData = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        SharedData: null,
        errormsg: ""
    }
    let userId = req.query.UserId;
    let query = SQLQueryPrama.GetSharedDataByUserQuery(userId);
    KnexRaw.raw(query).then(function (data) {
        JsonData._Issuccess = true;
        JsonData.SharedData = data;
        res.json(JsonData);
    }).catch(next)
}

module.exports = {
    TestSharedDataRoutes,
    GetSharedData
};