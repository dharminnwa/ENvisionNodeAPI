var logger = require("../Helper/logs");
var CreateLayerHelper = require("../Helper/CreateLayer");
var UtilityJs = require('../Helper/Utility');
const { DataSet } = require('../Models');

const TestCreateLayer = (req, res, next) => {
    logger.detaillog("CreateLayer Call Controller successfully");
    res.json("CreateLayer Call successfully");
}

const GetPipelineWizardData = (req, res, next) => {
    var data = CreateLayerHelper.GetPipelineWizardData(req, res, next);
    return data;
}

const GetRailWizardData = (req, res, next) => {
    var data = CreateLayerHelper.GetRailWizardData(req, res, next);
    return data;
}

const SaveLayer = (req, res, next) => {
    let parent = req.body.parent;
    var JsonData = {
        _Issuccess: false,
        DataSetData: null,
        errormsg: '',
    }
    parent = setLayerData(parent);
    DataSet.save(parent)
        .then(data => {
            let childs = req.body.childs;
            if (childs && childs.length > 0) {
                if (data && data.length > 0) {
                    for (let i = 0; i < childs.length; i++) {
                        childs[i].ParentDataSetID = data[0].DataSetID;
                        childs[i] = setLayerData(childs[i]);
                    }
                    DataSet.bulkSave(childs)
                        .then(child => {
                            // let resData = {
                            //     parent: data,
                            //     childs: child
                            // }
                            JsonData._Issuccess = true;
                            JsonData.DataSetData = data;
                            res.json(JsonData);
                        })
                        .catch(next);
                }
            }
        })
        .catch(next);
}

function setLayerData(param) {
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
    return param;
}

module.exports = {
    TestCreateLayer,
    GetPipelineWizardData,
    GetRailWizardData,
    SaveLayer
};

