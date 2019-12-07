var logger = require("../Helper/logs");
var HomeDashboSQLQueryPrama = require("../Helper/SqlQuery/HomeDashboardQuery");
const { KnexRaw } = require('../Models');
const { KnexRawPG } = require('../Models/PostgreDb');
const request = require('request');
var config = require('config');
var xmlParser = require('xml2json');

const HomeDashboardTest = (req, res, next) => {
    res.json(" Home Dashboard Test successfully");
}

// Start get Facilitty state,Commodity and Facility Type

const GetAssetLookupData = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        facilityList: null,
        stateList: null,
        errormsg: ""
    }
    let facilittTypequery = HomeDashboSQLQueryPrama.GetFacilitiesTypeQuery();
    let stateListQuery = HomeDashboSQLQueryPrama.GetStateQuery();
    KnexRaw.raw(facilittTypequery).then(function (ResDataFacilities) {
        JsonData._Issuccess = true;
        JsonData.facilityList = ResDataFacilities;
        KnexRaw.raw(stateListQuery).then(function (ResStateData) {
            JsonData.stateList = ResStateData;
            res.json(JsonData);
        });
    }).catch(next);
};

const GetTypeandCommoditybasedonstate = (req, res, next) => {
    var jsonData = {
        _Issuccess: false,
        Commodity: null,
        State: null,
        FacilittyType: null
    }
    let StateName = req.query.StateName;
    var splitStateName = StateName.split(',');
    var CommodityList = [];
    var FacilittyTypeList = [];
    var Statevalue = "";
    for (let c of splitStateName) {
        if (c) {
            if (Statevalue) {
                Statevalue += ",'" + c + "'";
            } else {
                Statevalue = "'" + c + "'";
            }
        }
    }
    let Query = 'select distinct "COMMODITY","FACTYPE" from xfacilities2018_10 where "STATE_NAME" in (' + Statevalue + ') and "COMMODITY" != ' + "'Unknown'";
    KnexRawPG.raw(Query).then(function (resData) {
        if (resData.rowCount > 0) {
            for (let i = 0; i < resData.rowCount; i++) {
                var d = resData.rows[i];
                let splitedcom = d.COMMODITY.split(',');
                for (let s of splitedcom) {
                    if (s)
                        CommodityList.push(s.trim());
                }
                if (d.FACTYPE) {
                    FacilittyTypeList.push(d.FACTYPE.trim());
                }

            }
            CommodityList = GetDistinctStringArray(CommodityList);
            FacilittyTypeList = GetDistinctStringArray(FacilittyTypeList);
            jsonData.Commodity = CommodityList;
            jsonData.FacilittyType = FacilittyTypeList;
        }
        jsonData._Issuccess = true;
        res.json(jsonData);

    }).catch(next);
}
const GetCommodityBasedonStateandType = (req, res, next) => {
    var jsonData = {
        _Issuccess: false,
        Commodity: null
    }
    let StateName = req.query.StateName;
    let Factype = req.query.Factype;
    var splittype = Factype.split(',');
    var splitStateName = StateName.split(',');
    var CommodityList = [];
    var typevalue = "";
    for (let c of splittype) {
        if (c) {
            if (typevalue) {
                typevalue += ",'" + c + "'";
            } else {
                typevalue = "'" + c + "'";
            }
        }
    }
    let Query = 'Select distinct "COMMODITY","STATE_NAME" from xfacilities2018_10 where "FACTYPE" in(' + typevalue + ') and "STATE_NAME" in (select distinct  "STATE_NAME" from xfacilities2018_10 where  "FACTYPE" in(' + typevalue + ')  and "STATE_NAME" is not null and "STATE_NAME" !=' + "''" + ' ) and "STATE_NAME" is not null and "STATE_NAME" !=' + "''" + ' order by "COMMODITY"'
    KnexRawPG.raw(Query).then(function (resData) {
        if (resData.rowCount > 0) {
            for (let i = 0; i < resData.rowCount; i++) {
                var s = resData.rows[i];
                if (splitStateName.indexOf(s.STATE_NAME) >= 0) {
                    let splitedcom = s.COMMODITY.split(',');
                    for (let s of splitedcom) {
                        if (s)
                            CommodityList.push(s);
                    }
                }
            }
            var Distinctstate = GetDistinctStringArray(CommodityList);
            jsonData.Commodity = Distinctstate;

        }
        jsonData._Issuccess = true;
        res.json(jsonData);

    }).catch(next);
}
const GetStateBasedonComodity = (req, res, next) => {
    var jsonData = {
        _Issuccess: false,
        commoditystate: null,
        Commodity: null
    }
    let Comodity = req.query.Comodity;
    let Factype = req.query.Factype;
    if (Factype && Comodity) {
        var splittype = Factype.split(',');
        var splitComodity = Comodity.split(',');
        var StateList = [];
        var typevalue = "";
        for (let c of splittype) {
            if (c) {
                if (typevalue) {
                    typevalue += ",'" + c + "'";
                } else {
                    typevalue = "'" + c + "'";
                }
            }
        }
        let Query = 'Select distinct "STATE_NAME","COMMODITY"  from xfacilities2018_10 where "FACTYPE" in(' + typevalue + ') and "COMMODITY" in (select distinct  "COMMODITY" from xfacilities2018_10 where  "FACTYPE" in(' + typevalue + '))' +
            " and " + '"STATE_NAME"' + " is not null and " + '"STATE_NAME"' + "!=''" +
            //' and  "STATE_NAME" is not null and  "STATE_NAME" !=''+
            ' order by "STATE_NAME"';
        KnexRawPG.raw(Query).then(function (resData) {
            if (resData.rowCount > 0) {
                for (let i = 0; i < resData.rowCount; i++) {
                    var s = resData.rows[i];
                    if (splitComodity.indexOf(s.COMMODITY) >= 0) {
                        StateList.push(s.STATE_NAME);
                    }
                }
                var Distinctstate = GetDistinctStringArray(StateList);
                jsonData.commoditystate = Distinctstate;

            }
            jsonData._Issuccess = true;
            res.json(jsonData);

        }).catch(next);
    }
}
const GetFactypeBasedonStateandCommodity = (req, res, next) => {
    var jsonData = {
        _Issuccess: false,
        commoditystate: null,
        Commodity: null,
        Factype: null
    }
    let Comodity = req.query.Comodity;
    let StateName = req.query.StateName;
    if (StateName && Comodity) {
        var splitstate = StateName.split(',');
        var splitComodity = Comodity.split(',');
        var FactypeList = [];
        var statevalue = "";
        for (let c of splitstate) {
            if (c) {
                if (statevalue) {
                    statevalue += ",'" + c + "'";
                } else {
                    statevalue = "'" + c + "'";
                }
            }
        }
        let Query = 'select distinct "FACTYPE","COMMODITY" from xfacilities2018_10 where "STATE_NAME" in(' + statevalue + ') and  "COMMODITY" in(select distinct "COMMODITY" from xfacilities2018_10 where "STATE_NAME" in(' + statevalue + ') and "STATE_NAME" is not null and "STATE_NAME" !=' + "''" + ') and "STATE_NAME" is not null and "STATE_NAME" !=' + "''" + ' order by "FACTYPE"';
        KnexRawPG.raw(Query).then(function (resData) {
            if (resData.rowCount > 0) {
                for (let i = 0; i < resData.rowCount; i++) {
                    var s = resData.rows[i];
                    if (s.COMMODITY.indexOf(splitComodity) >= 0) {
                        FactypeList.push(s.FACTYPE);
                    }
                }
                var DistinctFactype = GetDistinctStringArray(FactypeList);
                jsonData.Factype = DistinctFactype;
            }
            jsonData._Issuccess = true;
            res.json(jsonData);

        }).catch(next);
    }
}
const GetStateBasedonComodity_Sqldb = (req, res, next) => {
    var jsonData = {
        _Issuccess: false,
        commoditystate: null,
        Comodity: null
    }
    let Comodity = req.query.Comodity;
    let Factype = req.query.Factype;
    if (Factype && Comodity) {
        var splittype = Factype.split(',');
        var splitComodity = Comodity.split(',');
        var StateList = [];
        var typevalue = "";
        for (let c of splittype) {
            if (c) {
                if (typevalue) {
                    typevalue += ",'" + c + "'";
                } else {
                    typevalue = "'" + c + "'";
                }
            }
        }
        let Query = "select distinct STATE_NAME,COMMODITY  from [vwXfacilities] where FACTYPE in(" + typevalue + ") and COMMODITY in (select distinct  COMMODITY from [vwXfacilities] where  FACTYPE in(" + typevalue + "))" +
            " and STATE_NAME is not null and STATE_NAME !=''" +
            " order by STATE_NAME";
        KnexRaw.raw(Query).then(function (resData) {
            if (resData.length > 0) {
                for (let i = 0; i < resData.length; i++) {
                    var s = resData[i];
                    if (splitComodity.indexOf(s.COMMODITY) >= 0) {
                        StateList.push(s.STATE_NAME);
                    }
                }
                var Distinctstate = GetDistinctStringArray(StateList);
                jsonData.commoditystate = Distinctstate;

            }
            jsonData._Issuccess = true;
            res.json(jsonData);

        }).catch(next);
    }
}
const GetFacilityData = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        FacilityData: null,
        AllState: null,
        AllComodity: null,
        errormsg: ""
    }
    let FacilityQuery = HomeDashboSQLQueryPrama.GetAllFacilityDataQuery();
    KnexRaw.raw(FacilityQuery).then(function (ResDataFacilities) {
        JsonData._Issuccess = true;
        var Data = [];
        var AllState = "";
        var AllComodity = "";
        if (ResDataFacilities.length > 0) {
            for (var f = 0; f < ResDataFacilities.length; f++) {
                var FACData = ResDataFacilities[f];
                var FACTYPE = FACData.factype;
                var facCommodity = FACData.commodity.split(",");
                var facState = FACData.STATE_NAME.split(",");
                var FACCommodityList = GetDistinctStringArray(facCommodity);
                FACCommodityList = FACCommodityList.filter(x => x != " Unknown");
                var FACStateList = GetDistinctStringArray(facState);
                AllState += "," + FACData.STATE_NAME;
                AllComodity += "," + FACData.commodity;
                Data.push({ FACTYPE: FACTYPE, FACCommodity: FACCommodityList, FACState: FACStateList })
            }
            AllState = AllState.split(',');
            AllState = GetDistinctStringArray(AllState);
            AllComodity = AllComodity.split(',');
            AllComodity = GetDistinctStringArray(AllComodity);
            AllComodity = AllComodity.filter(x => x != " Unknown");
        }
        JsonData.FacilityData = Data;
        JsonData.AllState = AllState;
        JsonData.AllComodity = AllComodity;
        res.json(JsonData);
    }).catch(next);

}
//End Facility 

//Start get Pipeline Cmmodity,State and Status
const GetAllPipelineData = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        PipelineData: [],
        Allstate: null,
        AllCommodity: null,
        AllStatus: null,
        PowerPlant_primefuel: null,
        PowerPlant_primemover: null,
        powerplant_State_name: null,
        substations_Status: null,
        substations_Subtype: null,
        substations_State_Name: null,
        powerline_status: null,
        powerline_volt_cat: null,
        powerline_state_name: null,
        errormsg: ""
    }
    let Query = 'select distinct "COMMODITY",' + "''" + ' as "STATUS",' + "''" + ' as "STATE_NAME"' +
        ' ,' + "''" + ' as  PowerPlant_primefuel,' + "''" + ' as PowerPlant_primemover,' + "''" + ' as powerplant_State_name' +
        ' ,' + "''" + ' as substations_Status,' + "''" + ' as substations_Subtype,' + "''" + ' as substations_State_Name' +
        ' ,' + "''" + ' as powerline_status,' + "''" + 'as powerline_volt_cat,' + "''" + ' as powerline_state_name' +
        ' from xpipelines2018_10' +
        ' union all' +
        ' select distinct ' + "''" + ' as "COMMODITY","STATUS",' + "''" + ' as "STATE_NAME"' +
        ' ,' + "''" + ' as  PowerPlant_primefuel,' + "''" + ' as PowerPlant_primemover,' + "''" + ' as powerplant_State_name' +
        ' ,' + "''" + ' as substations_Status,' + "''" + ' as substations_Subtype,' + "''" + ' as substations_State_Name' +
        ' ,' + "''" + ' as powerline_status,' + "''" + ' as powerline_volt_cat,' + "''" + ' as powerline_state_name' +
        ' from xpipelines2018_10' +
        ' union all' +
        ' select distinct ' + "''" + ' as "COMMODITY",' + "''" + 'as "STATUS","STATE_NAME"' +
        ' ,' + "''" + ' as  PowerPlant_primefuel,' + "''" + ' as PowerPlant_primemover,' + "''" + ' as powerplant_State_name' +
        ' ,' + "''" + ' as substations_Status,' + "''" + ' as substations_Subtype,' + "''" + ' as substations_State_Name' +
        ' ,' + "''" + ' as powerline_status,' + "''" + ' as powerline_volt_cat,' + "''" + ' as powerline_state_name' +
        ' from xpipelines2018_10 where "STATE_NAME" is not null and "STATE_NAME" !=' + "''" +
        ' union all' +
        ' select distinct ' + "''" + ' as "COMMODITY",' + "''" + 'as "STATUS",' + "''" + ' as "STATE_NAME"' +
        ' ,"PRIMEFUEL" as PowerPlant_primefuel,' + "''" + ' as PowerPlant_primemover,' + "''" + ' as powerplant_State_name' +
        ' ,' + "''" + ' as substations_Status,' + "''" + ' as substations_Subtype,' + "''" + ' as substations_State_Name' +
        ' ,' + "''" + ' as powerline_status,' + "''" + ' as powerline_volt_cat,' + "''" + ' as powerline_state_name' +
        ' from xpowerplants2018_10' +
        ' union all' +
        ' select distinct ' + "''" + ' as "COMMODITY",' + "''" + ' as "STATUS",' + "''" + ' as "STATE_NAME"' +
        ' ,' + "''" + ' as PowerPlant_primefuel,"PRIMEMOVER" as PowerPlant_primemover,' + "''" + ' as powerplant_State_name' +
        ' ,' + "''" + ' as substations_Status,' + "''" + ' as substations_Subtype,' + "''" + ' as substations_State_Name' +
        ' ,' + "''" + ' as powerline_status,' + "''" + ' as powerline_volt_cat,' + "''" + ' as powerline_state_name' +
        ' from xpowerplants2018_10' +
        ' union all' +
        ' select distinct ' + "''" + ' as "COMMODITY",' + "''" + 'as "STATUS",' + "''" + ' as "STATE_NAME"' +
        ' ,' + "''" + ' as  PowerPlant_primefuel,' + "''" + ' as PowerPlant_primemover,"STATE_NAME" as powerplant_State_name' +
        ' ,' + "''" + ' as substations_Status,' + "''" + ' as substations_Subtype,' + "''" + ' as substations_State_Name' +
        ' ,' + "''" + ' as powerline_status,' + "''" + ' as powerline_volt_cat,' + "''" + ' as powerline_state_name' +
        ' from xpowerplants2018_10 as p where p."STATE_NAME" is not null and p."STATE_NAME" !=' + "''" +
        ' union all' +
        ' select distinct  ' + "''" + ' as "COMMODITY",' + "''" + 'as "STATUS",' + "''" + ' as "STATE_NAME"' +
        ' ,' + "''" + ' as  PowerPlant_primefuel,' + "''" + ' as PowerPlant_primemover,' + "''" + ' as powerplant_State_name' +
        ' ,"STATUS" as substations_Status,' + "''" + ' as substations_Subtype,' + "''" + ' as substations_State_Name' +
        ' ,' + "''" + ' as powerline_status,' + "''" + ' as powerline_volt_cat,' + "''" + ' as powerline_state_name' +
        ' from xsubstations2018_10' +
        ' union all' +
        ' select distinct  ' + "''" + ' as "COMMODITY",' + "''" + 'as "STATUS",' + "''" + ' as "STATE_NAME"' +
        ' ,' + "''" + ' as  PowerPlant_primefuel,' + "''" + ' as PowerPlant_primemover,' + "''" + ' as powerplant_State_name' +
        ' ,' + "''" + ' as substations_Status,"SUBTYPE" as substations_Subtype,' + "''" + ' as substations_State_Name' +
        ' ,' + "''" + ' as powerline_status,' + "''" + ' as powerline_volt_cat,' + "''" + ' as powerline_state_name' +
        ' from xsubstations2018_10' +
        ' union all' +
        ' select distinct  ' + "''" + ' as "COMMODITY",' + "''" + 'as "STATUS",' + "''" + ' as "STATE_NAME"' +
        ' ,' + "''" + ' as  PowerPlant_primefuel,' + "''" + ' as PowerPlant_primemover,' + "''" + ' as powerplant_State_name' +
        ' ,' + "''" + ' as substations_Status,' + "''" + ' as substations_Subtype,"STATE_NAME" as substations_State_Name' +
        ' ,' + "''" + ' as powerline_status,' + "''" + ' as powerline_volt_cat,' + "''" + ' as powerline_state_name' +
        ' from xsubstations2018_10 as s where s."STATE_NAME" is not null and s."STATE_NAME" !=' + "''" +
        ' union all' +
        ' select distinct ' + "''" + ' as "COMMODITY",' + "''" + 'as "STATUS",' + "''" + ' as "STATE_NAME"' +
        ' ,' + "''" + ' as  PowerPlant_primefuel,' + "''" + ' as PowerPlant_primemover,' + "''" + ' as powerplant_State_name' +
        ' ,' + "''" + ' as substations_Status,' + "''" + ' as substations_Subtype,' + "''" + ' as substations_State_Name' +
        ' ,"STATUS" as powerline_status,' + "''" + ' as powerline_volt_cat,' + "''" + ' as powerline_state_name' +
        ' from xpowerlines2018_10' +
        ' union all' +
        ' select distinct ' + "''" + ' as "COMMODITY",' + "''" + 'as "STATUS",' + "''" + ' as "STATE_NAME"' +
        ' ,' + "''" + ' as  PowerPlant_primefuel,' + "''" + ' as PowerPlant_primemover,' + "''" + ' as powerplant_State_name' +
        ' ,' + "''" + ' as substations_Status,' + "''" + ' as substations_Subtype,' + "''" + ' as substations_State_Name' +
        ' ,' + "''" + ' as powerline_status ,"VOLT_CAT" as powerline_volt_cat,' + "''" + ' as  powerline_state_name' +
        ' from xpowerlines2018_10' +
        ' union all' +
        ' select distinct ' + "''" + ' as "COMMODITY",' + "''" + 'as "STATUS",' + "''" + ' as "STATE_NAME"' +
        ' ,' + "''" + ' as  PowerPlant_primefuel,' + "''" + ' as PowerPlant_primemover,' + "''" + ' as powerplant_State_name' +
        ' ,' + "''" + ' as substations_Status,' + "''" + ' as substations_Subtype,' + "''" + ' as substations_State_Name' +
        ' ,' + "''" + ' as powerline_status,' + "''" + ' as powerline_volt_cat,"STATE_NAME" as powerline_state_name' +
        ' from xpowerlines2018_10 as p' +
        ' where p."STATE_NAME" is not null and p."STATE_NAME" !=' + "''";
    KnexRawPG.raw(Query).then(function (resData) {
        if (resData.rowCount > 0) {
            var commodity = [];
            var State = [];
            var Status = [];
            var PowerPlant_primefuel = [];
            var PowerPlant_primemover = [];
            var powerplant_State_name = [];
            var substations_Status = [];
            var substations_Subtype = [];
            var substations_State_Name = [];
            var powerline_status = [];
            var powerline_volt_cat = [];
            var powerline_state_name = [];
            for (let i = 0; i < resData.rowCount; i++) {
                var s = resData.rows[i];
                if (s.COMMODITY && s.COMMODITY != "Unknown") {
                    commodity.push(s.COMMODITY);
                }
                if (s.STATE_NAME) {
                    State.push(s.STATE_NAME);
                }
                if (s.STATUS) {
                    Status.push(s.STATUS);
                }

                if (s.powerplant_primefuel) {
                    PowerPlant_primefuel.push(s.powerplant_primefuel);
                }
                if (s.powerplant_primemover) {
                    PowerPlant_primemover.push(s.powerplant_primemover);
                }
                if (s.powerplant_state_name) {
                    powerplant_State_name.push(s.powerplant_state_name);
                }

                if (s.substations_status) {
                    substations_Status.push(s.substations_status);
                }
                if (s.substations_subtype) {
                    substations_Subtype.push(s.substations_subtype);
                }

                if (s.substations_state_name) {
                    substations_State_Name.push(s.substations_state_name);
                }
                if (s.powerline_status) {
                    powerline_status.push(s.powerline_status);
                }
                if (s.powerline_volt_cat) {
                    powerline_volt_cat.push(s.powerline_volt_cat);
                }
                if (s.powerline_state_name) {
                    powerline_state_name.push(s.powerline_state_name);
                }
            }
            JsonData.AllCommodity = commodity;
            JsonData.Allstate = State;
            JsonData.AllStatus = Status;
            JsonData.PowerPlant_primefuel = PowerPlant_primefuel;
            JsonData.PowerPlant_primemover = PowerPlant_primemover;
            JsonData.powerplant_State_name = powerplant_State_name;
            JsonData.substations_Status = substations_Status;
            JsonData.substations_Subtype = substations_Subtype;
            JsonData.substations_State_Name = substations_State_Name;
            JsonData.powerline_status = powerline_status;
            JsonData.powerline_volt_cat = powerline_volt_cat;
            JsonData.powerline_state_name = powerline_state_name;
        }
        JsonData._Issuccess = true;
        res.json(JsonData);
    }).catch(next);
}
const GetPiplelineDatabasedonFiltervalue = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        state: [],
        Commodity: [],
        Status: [],
        errormsg: ""
    }
    let commodityval = req.query.Commodity;
    let stateval = req.query.State;
    let statusval = req.query.Status;
    var Query = "";
    if (commodityval || stateval || statusval) {
        var commodityfilterval = '';
        var statefilterval = '';
        var statusfilterval = '';
        if (commodityval) {
            for (let c of commodityval.split(',')) {
                if (c) {
                    if (commodityfilterval) {
                        commodityfilterval += ",'" + c + "'";
                    } else {
                        commodityfilterval = "'" + c + "'";
                    }
                }
            }
        }
        if (stateval) {
            for (let c of stateval.split(',')) {
                if (c) {
                    if (statefilterval) {
                        statefilterval += ",'" + c + "'";
                    } else {
                        statefilterval = "'" + c + "'";
                    }
                }
            }
        }
        if (statusval) {
            for (let c of statusval.split(',')) {
                if (c) {
                    if (statusfilterval) {
                        statusfilterval += ",'" + c + "'";
                    } else {
                        statusfilterval = "'" + c + "'";
                    }
                }
            }
        }
        if (commodityfilterval && !statefilterval && !statusfilterval) {
            Query = 'select distinct "STATUS","STATE_NAME" from xpipelines2018_10 where "COMMODITY" in (' + commodityfilterval + ')';
        }
        else if (!commodityfilterval && statefilterval && !statusfilterval) {
            Query = 'select distinct "STATUS","COMMODITY" from xpipelines2018_10 where "STATE_NAME" in (' + statefilterval + ')';
        }
        else if (!commodityfilterval && !statefilterval && statusfilterval) {
            Query = 'select distinct "STATE_NAME","COMMODITY" from xpipelines2018_10 where "STATUS" in (' + statusfilterval + ')';
        }
        else if (commodityfilterval && !statefilterval && statusfilterval) {
            //Query = 'select distinct "STATE_NAME" from xpipelines2018_10 where "STATUS" in(select distinct "STATUS" from xpipelines2018_10 where "COMMODITY" in ('+commodityfilterval+'))';
            Query = 'select distinct "STATE_NAME" from xpipelines2018_10 where "STATUS" in(' + statusfilterval + ') and "COMMODITY" in (' + commodityfilterval + ')';
        }
        else if (!commodityfilterval && statefilterval && statusfilterval) {
            //Query = 'select distinct "STATE_NAME" from xpipelines2018_10 where "STATUS" in(select distinct "STATUS" from xpipelines2018_10 where "COMMODITY" in ('+commodityfilterval+'))';
            Query = 'select distinct "COMMODITY" from xpipelines2018_10 where "STATUS" in(' + statusfilterval + ') and "STATE_NAME" in (' + statefilterval + ')';
        }
        else if (commodityfilterval && statefilterval && !statusfilterval) {
            //Query = 'select distinct "STATE_NAME" from xpipelines2018_10 where "STATUS" in(select distinct "STATUS" from xpipelines2018_10 where "COMMODITY" in ('+commodityfilterval+'))';
            Query = 'select distinct "STATUS" from xpipelines2018_10 where "COMMODITY" in(' + commodityfilterval + ') and "STATE_NAME" in (' + statefilterval + ')';
        }
        if (Query) {
            KnexRawPG.raw(Query).then(function (resData) {
                if (resData.rowCount > 0) {
                    var commodity = [];
                    var State = [];
                    var Status = [];
                    for (let i = 0; i < resData.rowCount; i++) {
                        var s = resData.rows[i];
                        if (s.COMMODITY) {
                            commodity.push(s.COMMODITY);
                        }
                        if (s.STATE_NAME) {
                            State.push(s.STATE_NAME);
                        }
                        if (s.STATUS) {
                            Status.push(s.STATUS);
                        }
                    }
                    if (commodity.length > 0) {
                        commodity = GetDistinctStringArray(commodity);
                        commodity = commodity.filter(x => x != "Unknown");
                    }
                    if (State.length > 0)
                        State = GetDistinctStringArray(State);
                    if (Status.length > 0)
                        Status = GetDistinctStringArray(Status);
                    JsonData.Commodity = commodity;
                    JsonData.state = State;
                    JsonData.Status = Status;
                }
                JsonData._Issuccess = true;
                res.json(JsonData);
            }).catch(next);
        } else {
            res.json(JsonData);
        }
    } else {
        res.json(JsonData);
    }
}
//End Pipeline

// Start get Power Plant Fuel type,Primemover and StateName
const GetPowerPlantDatabasedonFilter = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        state: [],
        status: [],
        type: [],
        errormsg: ""
    }
    let Fueltypeval = req.query.Fueltype;
    let stateval = req.query.State;
    let PrimeMoverval = req.query.PrimeMover;
    var Query = "";
    if (Fueltypeval || stateval || PrimeMoverval) {
        var Fueltypefilterval = '';
        var statefilterval = '';
        var PrimeMoverfilterval = '';
        if (Fueltypeval) {
            for (let c of Fueltypeval.split(',')) {
                if (c) {
                    if (Fueltypefilterval) {
                        Fueltypefilterval += ",'" + c + "'";
                    } else {
                        Fueltypefilterval = "'" + c + "'";
                    }
                }
            }
        }
        if (stateval) {
            for (let c of stateval.split(',')) {
                if (c) {
                    if (statefilterval) {
                        statefilterval += ",'" + c + "'";
                    } else {
                        statefilterval = "'" + c + "'";
                    }
                }
            }
        }
        if (PrimeMoverval) {
            for (let c of PrimeMoverval.split(',')) {
                if (c) {
                    if (PrimeMoverfilterval) {
                        PrimeMoverfilterval += ",'" + c + "'";
                    } else {
                        PrimeMoverfilterval = "'" + c + "'";
                    }
                }
            }
        }
        if (Fueltypefilterval && !statefilterval && !PrimeMoverval) {
            Query = 'select distinct "PRIMEMOVER","STATE_NAME" from xpowerplants2018_10 where "PRIMEFUEL" in (' + Fueltypefilterval + ')';
        }
        else if (!Fueltypefilterval && statefilterval && !PrimeMoverval) {
            Query = 'select distinct "PRIMEMOVER","PRIMEFUEL" from xpowerplants2018_10 where "STATE_NAME" in (' + statefilterval + ')';
        }
        else if (!Fueltypefilterval && !statefilterval && PrimeMoverval) {
            Query = 'select distinct "STATE_NAME","PRIMEFUEL" from xpowerplants2018_10 where "PRIMEMOVER" in (' + PrimeMoverval + ')';
        }
        else if (Fueltypefilterval && !statefilterval && PrimeMoverval) {
            //Query = 'select distinct "STATE_NAME" from xpipelines2018_10 where "STATUS" in(select distinct "STATUS" from xpipelines2018_10 where "COMMODITY" in ('+commodityfilterval+'))';
            Query = 'select distinct "STATE_NAME" from xpowerplants2018_10 where "PRIMEMOVER" in(' + PrimeMoverval + ') and "PRIMEFUEL" in (' + Fueltypefilterval + ')';
        }
        else if (!Fueltypefilterval && statefilterval && PrimeMoverval) {
            //Query = 'select distinct "STATE_NAME" from xpipelines2018_10 where "STATUS" in(select distinct "STATUS" from xpipelines2018_10 where "COMMODITY" in ('+commodityfilterval+'))';
            Query = 'select distinct "PRIMEFUEL" from xpowerplants2018_10 where "PRIMEMOVER" in(' + PrimeMoverval + ') and "STATE_NAME" in (' + statefilterval + ')';
        }
        else if (Fueltypefilterval && statefilterval && !PrimeMoverval) {
            Query = 'select distinct "PRIMEMOVER" from xpowerplants2018_10 where "PRIMEFUEL" in(' + Fueltypefilterval + ') and "STATE_NAME" in (' + statefilterval + ')';
        }
        if (Query) {
            KnexRawPG.raw(Query).then(function (resData) {
                if (resData.rowCount > 0) {
                    var Fueltype = [];
                    var State = [];
                    var PrimeMover = [];
                    for (let i = 0; i < resData.rowCount; i++) {
                        var s = resData.rows[i];
                        if (s.PRIMEFUEL) {
                            Fueltype.push(s.PRIMEFUEL);
                        }
                        if (s.STATE_NAME) {
                            State.push(s.STATE_NAME);
                        }
                        if (s.PRIMEMOVER) {
                            PrimeMover.push(s.PRIMEMOVER);
                        }
                    }
                    if (Fueltype.length > 0)
                        Fueltype = GetDistinctStringArray(Fueltype);
                    if (State.length > 0)
                        State = GetDistinctStringArray(State);
                    if (PrimeMover.length > 0)
                        PrimeMover = GetDistinctStringArray(PrimeMover);
                    JsonData.Fueltype = Fueltype;
                    JsonData.state = State;
                    JsonData.PrimeMover = PrimeMover;
                }
                JsonData._Issuccess = true;
                res.json(JsonData);
            }).catch(next);
        } else {
            res.json(JsonData);
        }
    } else {
        res.json(JsonData);
    }
}
// End Power Plant

// Start Get Substation Status,type and States 
const GetSubstationDatabasedonfilter = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        state: [],
        Status: [],
        Subtype: [],
        errormsg: ""
    }
    let statusval = req.query.status;
    let stateval = req.query.State;
    let sybtypeval = req.query.sybtype;
    var Query = "";
    if (statusval || stateval || sybtypeval) {
        var statusfilterval = '';
        var statefilterval = '';
        var subtypefilterval = '';
        if (statusval) {
            for (let c of statusval.split(',')) {
                if (c) {
                    if (statusfilterval) {
                        statusfilterval += ",'" + c + "'";
                    } else {
                        statusfilterval = "'" + c + "'";
                    }
                }
            }
        }
        if (stateval) {
            for (let c of stateval.split(',')) {
                if (c) {
                    if (statefilterval) {
                        statefilterval += ",'" + c + "'";
                    } else {
                        statefilterval = "'" + c + "'";
                    }
                }
            }
        }
        if (sybtypeval) {
            for (let c of sybtypeval.split(',')) {
                if (c) {
                    if (subtypefilterval) {
                        subtypefilterval += ",'" + c + "'";
                    } else {
                        subtypefilterval = "'" + c + "'";
                    }
                }
            }
        }
        if (statusfilterval && !statefilterval && !subtypefilterval) {
            Query = 'select distinct "SUBTYPE","STATE_NAME" from xsubstations2018_10 where "STATUS" in (' + statusfilterval + ')';
        }
        else if (!statusfilterval && statefilterval && !subtypefilterval) {
            Query = 'select distinct "SUBTYPE","STATUS" from xsubstations2018_10 where "STATE_NAME" in (' + statefilterval + ')';
        }
        else if (!statusfilterval && !statefilterval && subtypefilterval) {
            Query = 'select distinct "STATE_NAME","STATUS" from xsubstations2018_10 where "SUBTYPE" in (' + subtypefilterval + ')';
        }
        else if (statusfilterval && !statefilterval && subtypefilterval) {
            Query = 'select distinct "STATE_NAME" from xsubstations2018_10 where "STATUS" in(' + statusfilterval + ') and "SUBTYPE" in (' + subtypefilterval + ')';
        }
        else if (!statusfilterval && statefilterval && subtypefilterval) {
            Query = 'select distinct "STATUS" from xsubstations2018_10 where "SUBTYPE" in(' + subtypefilterval + ') and "STATE_NAME" in (' + statefilterval + ')';
        }
        else if (statusfilterval && statefilterval && !subtypefilterval) {
            Query = 'select distinct "SUBTYPE" from xsubstations2018_10 where "STATUS" in(' + statusfilterval + ') and "STATE_NAME" in (' + statefilterval + ')';
        }
        if (Query) {
            KnexRawPG.raw(Query).then(function (resData) {
                if (resData.rowCount > 0) {
                    var status = [];
                    var State = [];
                    var subtype = [];
                    for (let i = 0; i < resData.rowCount; i++) {
                        var s = resData.rows[i];
                        if (s.STATUS) {
                            status.push(s.STATUS);
                        }
                        if (s.STATE_NAME) {
                            State.push(s.STATE_NAME);
                        }
                        if (s.SUBTYPE) {
                            subtype.push(s.SUBTYPE);
                        }
                    }
                    if (status.length > 0)
                        status = GetDistinctStringArray(status);
                    if (State.length > 0)
                        State = GetDistinctStringArray(State);
                    if (subtype.length > 0)
                        subtype = GetDistinctStringArray(subtype);
                    JsonData.Status = status;
                    JsonData.state = State;
                    JsonData.Subtype = subtype;
                }
                JsonData._Issuccess = true;
                res.json(JsonData);
            }).catch(next);
        } else {
            res.json(JsonData);
        }
    } else {
        res.json(JsonData);
    }
}
//End substation

// start Get TransmissionLine status,voltage and states
const GetTransmissionDatabasedonFilter = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        state: [],
        Status: [],
        voltage: [],
        errormsg: ""
    }
    let statusval = req.query.status;
    let stateval = req.query.State;
    let Voltageval = req.query.Voltage;
    var Query = "";
    if (statusval || stateval || Voltageval) {
        var statusfilterval = '';
        var statefilterval = '';
        var Voltagefilterval = '';
        if (statusval) {
            for (let c of statusval.split(',')) {
                if (c) {
                    if (statusfilterval) {
                        statusfilterval += ",'" + c + "'";
                    } else {
                        statusfilterval = "'" + c + "'";
                    }
                }
            }
        }
        if (stateval) {
            for (let c of stateval.split(',')) {
                if (c) {
                    if (statefilterval) {
                        statefilterval += ",'" + c + "'";
                    } else {
                        statefilterval = "'" + c + "'";
                    }
                }
            }
        }
        if (Voltageval) {
            for (let c of Voltageval.split(',')) {
                if (c) {
                    if (Voltagefilterval) {
                        Voltagefilterval += ",'" + c + "'";
                    } else {
                        Voltagefilterval = "'" + c + "'";
                    }
                }
            }
        }
        if (statusfilterval && !statefilterval && !Voltagefilterval) {
            Query = 'select distinct "VOLT_CAT","STATE_NAME" from xpowerlines2018_10 where "STATUS" in (' + statusfilterval + ')';
        }
        else if (!statusfilterval && statefilterval && !Voltagefilterval) {
            Query = 'select distinct "VOLT_CAT","STATUS" from xpowerlines2018_10 where "STATE_NAME" in (' + statefilterval + ')';
        }
        else if (!statusfilterval && !statefilterval && Voltagefilterval) {
            Query = 'select distinct "STATE_NAME","STATUS" from xpowerlines2018_10 where "VOLT_CAT" in (' + Voltagefilterval + ')';
        }
        else if (statusfilterval && !statefilterval && Voltagefilterval) {
            Query = 'select distinct "STATE_NAME" from xpowerlines2018_10 where "STATUS" in(' + statusfilterval + ') and "VOLT_CAT" in (' + Voltagefilterval + ')';
        }
        else if (!statusfilterval && statefilterval && Voltagefilterval) {
            Query = 'select distinct "STATUS" from xpowerlines2018_10 where "VOLT_CAT" in(' + Voltagefilterval + ') and "STATE_NAME" in (' + statefilterval + ')';
        }
        else if (statusfilterval && statefilterval && !Voltagefilterval) {
            Query = 'select distinct "VOLT_CAT" from xpowerlines2018_10 where "STATUS" in(' + statusfilterval + ') and "STATE_NAME" in (' + statefilterval + ')';
        }
        if (Query) {
            KnexRawPG.raw(Query).then(function (resData) {
                if (resData.rowCount > 0) {
                    var status = [];
                    var State = [];
                    var voltagelist = [];
                    for (let i = 0; i < resData.rowCount; i++) {
                        var s = resData.rows[i];
                        if (s.STATUS) {
                            status.push(s.STATUS);
                        }
                        if (s.STATE_NAME) {
                            State.push(s.STATE_NAME);
                        }
                        if (s.VOLT_CAT) {
                            voltagelist.push(s.VOLT_CAT);
                        }
                    }
                    if (status.length > 0)
                        status = GetDistinctStringArray(status);
                    if (State.length > 0)
                        State = GetDistinctStringArray(State);
                    if (voltagelist.length > 0)
                        voltagelist = GetDistinctStringArray(voltagelist);
                    JsonData.Status = status;
                    JsonData.state = State;
                    JsonData.voltage = voltagelist;
                }
                JsonData._Issuccess = true;
                res.json(JsonData);
            }).catch(next);
        } else {
            res.json(JsonData);
        }
    } else {
        res.json(JsonData);
    }
}
// End Transmission Line
const GetParcelStates = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        ParcelStateData: null,
        Errormsg: "",
        DBFProperties: "",
        DetailPanelProperties: ""
    }
    let UserID = req.query.UserId;
    let ParcelStateQuery = HomeDashboSQLQueryPrama.GetParcelsStateQuery(UserID);
    let ParcelStateCountyQuery = HomeDashboSQLQueryPrama.GetParcelsCountyQuery();
    let ParcelLayerQuery = HomeDashboSQLQueryPrama.GetParcelLayertable();
    KnexRaw.raw(ParcelLayerQuery).then(function (ResParcelLayer) {
        let TableList = ResParcelLayer[0].ParcelDatatablename.split('@');
        KnexRaw.raw(ParcelStateQuery).then(function (ResParcelStateData) {
            JsonData._Issuccess = true;
            let Data = ResParcelStateData;
            KnexRaw.raw(ParcelStateCountyQuery).then(function (ResstateCounty) {
                let CountyData = ResstateCounty;
                for (let i = 0; i < Data.length; i++) {
                    let statecode = Data[i].StateCode.trim();
                    Data[i].counties = CountyData.filter(function (el) {
                        if (el.State == statecode) {
                            let fipsstring = "";
                            if (parseInt(el.FIPS) < 9999) {
                                fipsstring = "0" + el.FIPS;
                            }
                            else {
                                fipsstring = el.FIPS;
                            }
                            if (TableList.includes("ParcelPoints_" + fipsstring)) {
                                el["LayerTableName"] = el.County + ":ParcelPoints_" + fipsstring + "#";
                            }
                            return el;
                        }
                    });
                }
                JsonData.DBFProperties = "fid,PARCELAPN,FIPS,TAXAPN,STHSNUM,STDIR,STSTNAME,STSUFFIX,STQUADRANT,STUNITPRFX,STUNITNUM,STCITY,STSTATE,STZIP,STZIP4,XCOORD,YCOORD,GEOSOURCE,ADDRSCORE,OWN1,OWN2,MHSNUMB,MPREDIR,MSTNAME,MMODE,MQUADRNT,MUNITPRFX,MUNITNUM,MCITY,MSTATE,MZIP,MZIP4,LEGAL1,AREA";
                JsonData.DetailPanelProperties = "APN=TAXAPN,Owner=OWN1,Owner2=OWN2,Street Num=STHSNUM,Street Dir=STDIR,Street Name=STSTNAME,Street Unit=STUNITNUM,City=STCITY,State=STSTATE,Zip=STZIP,Legal=LEGAL1";
                JsonData.ParcelStateData = Data;
                res.json(JsonData);
            }).catch(next);

        }).catch(next);
    }).catch(next);

};

const GetWellsstate = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        WellsstateData: null,
        errormsg: ""
    }
    let WellsQuery = HomeDashboSQLQueryPrama.GetWellsstateQuery();
    KnexRaw.raw(WellsQuery).then(function (ResWellsData) {
        let Data = ResWellsData;
        JsonData._Issuccess = true;
        for (let i = 0; i < Data.length; i++) {
            let WellType = Data[i].WellType;
            let WellStatus = Data[i].WellStatus;
            let Counties = Data[i].Counties;
            if (WellType) {
                Data[i].WellType = null
                Data[i].WellType = WellType.split(';');
            }
            if (WellStatus) {
                Data[i].WellStatus = null;
                Data[i].WellStatus = WellStatus.split(';');
            }
            if (Counties) {
                Data[i].Counties = null;
                Data[i].Counties = Counties.split(';');
            }
            if (!Data[i].DBFProperties) {
                if (Data[i].StateID == 165 && Data[i].WMSLayer == 'vw_wells_mos')
                    Data[i] = setDBFPropertiesforWellsMos(Data[i]);
                if (Data[i].StateID == 168 && Data[i].WMSLayer == 'wells_nv')
                    Data[i] = setDBFPropertiesforWellsNv(Data[i]);
                if (Data[i].StateID == 171 && Data[i].WMSLayer == 'vw_wells_nmexico')
                    Data[i] = setDBFPropertiesforWellsNmaxico(Data[i]);
            }
        }
        JsonData.WellsstateData = Data;
        res.json(JsonData);
    }).catch(next);
};

const GetTransProjects = (req, res, next) => {
    let URL = config.HomeDashboardXmlfileUrl.TrnsmissionProjectURL;
    let requestres = {
        _Issuccess: false,
        TransProjectsData: null,
        errorMessage: null
    }
    request(URL, (error, response, body) => {
        if (error) {
            logger.error("HomeDashboardcontroller", "GetTransProjects", error);
            requestres.errorMessage = error;
        }
        else {
            logger.detaillog("HomeDashboard controller GetTransProjects method call successfully");
            let xmltoJsonData = xmlParser.toJson(response.body);
            let Jsondatawxml = JSON.parse(xmltoJsonData);
            requestres._Issuccess = true;
            requestres.TransProjectsData = Jsondatawxml.rss.channel.item;
        }
        res.json(requestres);
    });
};

const GetPipelineActivities = (req, res, next) => {
    let URL = config.HomeDashboardXmlfileUrl.PipelineActivitiesURL;
    let requestres = {
        _Issuccess: false,
        PipelineActivitiesData: null,
        errorMessage: null
    }
    request(URL, (error, response, body) => {
        if (error) {
            logger.error("HomeDashboardcontroller", "GetPipelineActivities", error);
            requestres.errorMessage = error;
        }
        else {
            logger.detaillog("HomeDashboard controller GetPipelineActivities method call successfully");
            let xmltoJsonData = xmlParser.toJson(response.body);
            let Jsondatawxml = JSON.parse(xmltoJsonData);
            requestres._Issuccess = true;
            requestres.PipelineActivitiesData = Jsondatawxml.rss.channel.item;
        }
        res.json(requestres);
    });
};

function setDBFPropertiesforWellsMos(data) {
    data.DetailPanelPropertiesMain = "gid,OBJECTID,County,API,Operator,ORIGINAL_O,LeaseName,WellNumber,WellType,STATUS_DAT,CONFIDENTI,Status,BONDED_Y_N,DATE_APPRO,DATE_CANCE,SpudDt,CompleteDt,DATE_RECON,DATE_FRACT,Quadrant,4th Quarter,3rd Quarter,2nd Quarter,1st Quarter,Township,Range,RANGE_DIRE,Section,LAND_GRANT,SURVEY_LOC,SURVEY_L_1,LATITUDE,LAT_DEGREE,LAT_MINUTE,LAT_SECOND,LAT_DECIMA,LONGITUDE,LONG_DEGRE,LONG_MINUT,LONG_SECON,LONG_DIREC,LONG_DECIM,Elevation,PROPOSED_T,ACTUAL_TOT,LOG_DEPTH,PLUG_BACK,PERFORATIO,LOG_TYPE,InitialProduction,SPL_LOG,GRAVITY,GOR,PRODUCING,AVG_DAILY,MAX_DAILY,CUTTINGS_R,CUTTINGS_S,MIT_1,MIT_2,MIT_3,MIT_4,MIT_5,MIT_6,MIT_7,MIT_8,LAST_MIT,LAST_MIT_W,MIT_COMMEN,WIT_1,WIT_2,WIT_3,WIT_4,WIT_5,WIT_6,WIT_7,WIT_8,INSPECTION,INSPECTI_1,INSPECTI_2,INSPECTI_3,INSPECTI_4,LAST_INSPE,LOCATION_C,Comment,ANALYSIS,Link,the_geom,WellStatus";
    data.DBFProperties = "WellType,Status,LeaseName,API,Operator,County,Link,CompleteDt";
    data.DetailPanelProperties = "API=API,Operator=Operator,Well Type=WellType,Well Status=Status,Lease Name=LeaseName,Date Completed=CompleteDt";
    return data;
}

function setDBFPropertiesforWellsNv(data) {
    data.DetailPanelPropertiesMain = "gid,API,County,PermitNumb,Operator,WellName,Section,Township,Range,Location,PermitDate,CompleteDa,WellStatus,Depth,Elevation,Logs,WellType,Field,Comments,the_geom,link";
    data.DBFProperties = "WellName,WellStatus,API,Operator,County,link,CompleteDa";
    data.DetailPanelProperties = "Well Name=WellName,Well Status=WellStatus,API=API,Operator=Operator,County=County";
    return data;
}
function setDBFPropertiesforWellsNmaxico(data) {
    data.DetailPanelPropertiesMain = "gid,OBJECTID,API,WellName,WellNumber,WellType,Lease,Status,PermitDate,Section,Township,Range,Footages,SpudDate,Depth,Elevation,LastInspectedDate,PlugDate,Operator,District,Link,the_geom,WellStatus,County";
    data.DBFProperties = "WellName,WellStatus,API,Operator,County,Link";
    data.DetailPanelProperties = "Well Name=WellName,Well Status=WellStatus,API=API,Operator=Operator,County=County";
    return data;
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
    HomeDashboardTest,
    GetAssetLookupData,
    GetParcelStates,
    GetWellsstate,
    GetTransProjects,
    GetPipelineActivities,
    GetFacilityData,
    GetStateBasedonComodity,
    GetCommodityBasedonStateandType,
    GetFactypeBasedonStateandCommodity,
    GetAllPipelineData,
    GetPiplelineDatabasedonFiltervalue,
    GetTypeandCommoditybasedonstate,
    GetPowerPlantDatabasedonFilter,
    GetSubstationDatabasedonfilter,
    GetTransmissionDatabasedonFilter
};