const { KnexRaw } = require('../../Models/ResearchDb');
var PowerPlantsQueryList = require('../../Helper/SqlQuery/IntelligenceSqlQuery/PowerPlantsQuery')
const request = require('request');
var logger = require("../../Helper/logs");
var UtilityJs = require("../../Helper/Utility");
const GetAllPowerPlants = (req, res, next) => {
    let JsonData = {
        _Issuccess: false,
        PowerPlantsData: null,
        errormsg: ""
    }
    let Query = PowerPlantsQueryList.GetAllPowerPlantData();
    KnexRaw.raw(Query).then(function (ResData) {
        JsonData._Issuccess = true;
        JsonData.PowerPlantsData = ResData;
        res.json(JsonData);
    }).catch(next);
};
const GetAllPowerPlantFilterOptions = (req, res, next) => {
    let JsonData = {
        _Issuccess: false,
        FilterOptionData: {
            sates: null,
            nerc: null,
            fuelType: null,
            sector: null,
            isO_RTO: null
        },
        errormsg: ""
    }
    let stateQuery = PowerPlantsQueryList.GetPowerPlantState();
    let SectorQuery = PowerPlantsQueryList.GetPowerPlantSector();
    let PrimaryFuelQuery = PowerPlantsQueryList.GetPowerPlantPrimaryFuel();
    let NercQuery = PowerPlantsQueryList.GetPowerPlantNERC();
    let ISO_RTOQuery = PowerPlantsQueryList.GetPowerPlantISO_RTO();
    KnexRaw.raw(stateQuery).then(function (StateresData) {
        JsonData._Issuccess = true;
        JsonData.FilterOptionData.sates = StateresData;
        KnexRaw.raw(SectorQuery).then(function (SectorresData) {
            JsonData.FilterOptionData.sector = SectorresData;
            KnexRaw.raw(PrimaryFuelQuery).then(function (PrimaryFuelData) {
                JsonData.FilterOptionData.fuelType = PrimaryFuelData;
                KnexRaw.raw(NercQuery).then(function (NercData) {
                    JsonData.FilterOptionData.nerc = NercData;
                    KnexRaw.raw(ISO_RTOQuery).then(function (ISO_RTOresData) {
                        JsonData.FilterOptionData.isO_RTO = ISO_RTOresData;
                        res.json(JsonData);
                    });
                });
            });
        });
    }).catch(next);

};
const GetSuggestivePowerplantResults = (req, res, next) => {
    let JsonData = {
        _Issuccess: false,
        SuggestivePowerplantData: null,
        errormsg: ""
    }
    let Query = PowerPlantsQueryList.GetSuggestivePowerplant();
    KnexRaw.raw(Query).then(function (resData) {
        var Data = resData[0].SuggestivePowerplant;
        let SplitedData = Data.split('@');
        SplitedData = GetDistinctStringArray(SplitedData);
        JsonData._Issuccess = true;
        JsonData.SuggestivePowerplantData = SplitedData;
        res.json(JsonData);
    }).catch(next);
};
const GetPowerPlantByID = (req, res, next) => {
    let JsonData = {
        _Issuccess: false,
        GetPowerPlantByIDData: null,
        errormsg: ""
    }
    let powerid = req.query.PowerID;
    let compnayid = req.query.CompanyID;
    let PowerplantsQuery = PowerPlantsQueryList.GetPowerPlantdDetialsQuery(powerid, compnayid)
    let PowerUnitsQuery = PowerPlantsQueryList.GetPowerUnitsDetailsQuery(powerid)
    KnexRaw.raw(PowerplantsQuery).then(function (resPowerData) {
        JsonData._Issuccess = true;
        JsonData.GetPowerPlantByIDData = resPowerData[0];
        JsonData.GetPowerPlantByIDData["PowerUnits"] = [];
        KnexRaw.raw(PowerUnitsQuery).then(function (resPowerUnits) {
            JsonData.GetPowerPlantByIDData["PowerUnits"] = resPowerUnits;
            res.json(JsonData);
        });
    }).catch(next);
};
const GetPlantOperatorByID = (req, res, next) => {
    let JsonData = {
        _Issuccess: false,
        GetPlantOperatorByIDData: null,
        Capacity: null,
        errormsg: ""
    }
    let compnayid = req.query.CompanyID;
    let PlantOperatorQuer = PowerPlantsQueryList.GetPlantOperatorQuery(compnayid)
    let PlantOperatorPowers = PowerPlantsQueryList.GetPlantOperatorPowersQuery(compnayid)
    KnexRaw.raw(PlantOperatorQuer).then(function (resPlantOperator) {
        JsonData._Issuccess = true;
        JsonData.GetPlantOperatorByIDData = resPlantOperator[0];
        JsonData.GetPlantOperatorByIDData["Plants"] = [];
        KnexRaw.raw(PlantOperatorPowers).then(function (resPlantOperator) {
            JsonData.GetPlantOperatorByIDData["Plants"] = resPlantOperator;
            let Distinctval = UtilityJs.GetDistinctValue(resPlantOperator, "PrimaryFuel");
            let CapacityData = [];
            for (let i = 0; i < Distinctval.length; i++) {
                let List = resPlantOperator.filter(el => el.PrimaryFuel === Distinctval[i]);
                let capacity = 0;
                for (let j = 0; j < List.length; j++) {
                    capacity = capacity + parseFloat(List[j].CapacityMWs);
                }
                var resdata = {
                    Key: Distinctval[i],
                    Value: capacity
                }
                CapacityData.push(resdata);
            }
            JsonData.Capacity = CapacityData;
            res.json(JsonData);
        });
    }).catch(next);
}
function GetDistinctStringArray(Stringarray) {
    try {
        Stringarray = Stringarray.filter(function (elem, pos) {
            if (elem) {
                return Stringarray.indexOf(elem) == pos;
            }
        });
        return Stringarray.sort();
    } catch (e) { return null; }

}
module.exports = {
    GetAllPowerPlants,
    GetAllPowerPlantFilterOptions,
    GetSuggestivePowerplantResults,
    GetPowerPlantByID,
    GetPlantOperatorByID
}