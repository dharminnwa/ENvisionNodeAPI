var logger = require("../Helper/logs");
var SQLQueryPrama = require("../Helper/SqlQuery/LayerQuery");
var SQLUserQuery = require("../Helper/SqlQuery/UserQuery");
var UtilityJs = require("../Helper/Utility");
const { KnexRaw, DataSet } = require('../Models');
var removedCategoryIds = [152, 155, 156];
const GlobaMapSearchEnergyLayerLibrary = (req, res, next) => {
    var JsonData = {
        LayerLibrary: null,
        errormsg: '',
        Body: req.query,
        TotalCount: 0
    }
    var queryOfLayerCategoriesRole = SQLUserQuery.GetLayerCategoriesRolesIdsQuery(req.query.UserId);
    KnexRaw.raw(queryOfLayerCategoriesRole).then(data => {
        let categoryIdsBasedOnRole = data.map(x => x.CategoryId);
        for (let i = 0; i < removedCategoryIds.length; i++) {
            let categoryItem = removedCategoryIds[i];
            let removedItemIndex = categoryIdsBasedOnRole.findIndex(x=> x == categoryItem);
            if(removedItemIndex > -1)
                categoryIdsBasedOnRole.splice(removedItemIndex, 1);
        }
        categoryIdsBasedOnRole = categoryIdsBasedOnRole.toString();
    _EnergyLayerQery = SQLQueryPrama.GetGlobalEnergyLayerquery(req.query, categoryIdsBasedOnRole);
    KnexRaw.raw(_EnergyLayerQery)
        .then(function (Data) {
            var SQLRes = Data;
            if (SQLRes.length > 0 && req.query.UserID) {
                SQLRes = SQLRes.map((el) => {
                    var o = Object.assign({}, el);
                    o.EnergyLayerStylesByUsers = [];
                    return o;
                });
                let _QueryEnergyLayerSylebyUser = " select * from EnergyLayerStylesByUser ELSBU where ELSBU.UserID='" + req.query.UserID + "' order by EnergyLayerId";
                KnexRaw.raw(_QueryEnergyLayerSylebyUser)
                    .then(function (stylebyuserData) {
                        var _stylebyuserData = stylebyuserData;
                        if (_stylebyuserData.length > 0) {
                            for (let i = 0; i < SQLRes.length; i++) {
                                let EnergyLayer = SQLRes[i];
                                for (let j = 0; j < _stylebyuserData.length; j++) {
                                    let Stybydata = _stylebyuserData[j];
                                    if (EnergyLayer.EnergyLayerID == Stybydata.EnergyLayerId && Stybydata.UserId == req.query.UserID) {
                                        EnergyLayer.EnergyLayerStylesByUsers.push(Stybydata);
                                    }
                                }
                            }
                            JsonData.LayerLibrary = SQLRes;
                            JsonData.errormsg = "";
                            JsonData.TotalCount = JsonData.LayerLibrary[0].TotalRows;
                            res.json(JsonData);
                        }
                        else {
                            JsonData.LayerLibrary = SQLRes;
                            JsonData.TotalCount = JsonData.LayerLibrary[0].TotalRows;
                            JsonData.errormsg = "";
                            res.json(JsonData);
                        }
                    }).catch(function (error) {
                        logger.error("GlobalSearch", "GlobaMapSearchEnergyLayer", error);
                        JsonData.LayerLibrary = SQLRes;
                        JsonData.TotalCount = JsonData.LayerLibrary[0].TotalRows;
                        res.json(JsonData);
                    });
            }
            else {
                JsonData.LayerLibrary = SQLRes;
                res.json(JsonData);
            }
        }).catch(next);
}).catch (next);


};
const SaveDatasetsValues = (req, res, next) => {
    let param = req.body;
    var JsonData = {
        _Issuccess: false,
        DataSetData: null,
        errormsg: '',
    }
    param.DataSetGUID = UtilityJs.GenerateGUID();
    param.UploadedDate = new Date();
    param.ModifiedDate = new Date();
    let ColKey = Object.keys(param);
    let dataFields = "Attributes,BBox,Citation,Count,DBFProperties,DataSetGUID,DataSetName,DateIS,Description,DetailPanelProperties,ExternalIconId,FilePathLocation,FilesIncluded,FillColor,FilterValue,IconType,IsDeleted,IsEnabled,IsFolder,IsIconDisabled,IsLabelVisible,IsPublic,IsSaveSearch,LabelField,LayerTypeID,ModifiedDate,Opacity,ParcelBufferID,ParentDataSetID,PreviewImage,PropertyTypes,PublishedDate,RepresentationType,SizePercent,SortNumber,Source,StrokeColor,StrokeThicknessPercent,TableName,Tags,UploadFileType,UploadedBy,UploadedDate,ZoomMax,ZoomMin";
    dataFields = dataFields.split(',');
    for (let i = 0; i < ColKey.length; i++) {
        if (!param[ColKey[i]]) {
            param[ColKey[i]] = null;
        }
        if (dataFields.indexOf(ColKey[i]) == -1)
            delete param[ColKey[i]];
        if (param[ColKey[i]]) {
            if (param[ColKey[i]].toString().toLowerCase() == "true")
                param[ColKey[i]] = "1";
            if (param[ColKey[i]].toString().toLowerCase() == "false")
                param[ColKey[i]] = "0";
        }
    }
    if (!param.UploadFileType)
        param.UploadFileType = "";
    DataSet.save(param)
        .then(data => {
            JsonData._Issuccess = true;
            JsonData.DataSetData = data;
            res.json(JsonData);
        })
        .catch(next);
}

module.exports = {
    GlobaMapSearchEnergyLayerLibrary,
    SaveDatasetsValues
};