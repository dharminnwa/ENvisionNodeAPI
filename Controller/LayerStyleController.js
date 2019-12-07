var UtilityJs = require("../Helper/Utility");
var SQLQueryPrama = require("../Helper/SqlQuery/LayerQuery");

const { KnexRaw } = require('../Models');

const SaveLayerStyles = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        errormsg: '',
        EnergyLayerStylesByUser: null
    }
    let Getquery = SQLQueryPrama.GetSavestyleQuery(req.body);
    KnexRaw.raw(Getquery).then(function (Data) {
        var SQLRes = Data;
        JsonData.EnergyLayerStylesByUser = SQLRes;
        JsonData._Issuccess = true;
        res.json(JsonData);
    }).catch(next);

}

const SaveCustomSymbols = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        ExternalIcon: null,
        errormsg: '',
    }
    let base64Image = req.body.base64Icon;
    let parts = base64Image.split(';');
    let imageData = parts[1].split(',')[1];
    UtilityJs.ResizeImage(imageData, 25, 25)
        .then(resizedImageBuffer => {
            let resizedImageData = resizedImageBuffer.toString('base64');
            var img = new Buffer(resizedImageData, 'base64');
            var externalIcon = req.body;
            if (img.length > 0)
                externalIcon["icon"] = img;
            if (resizedImageData) {
                externalIcon["resizedImageData"] = resizedImageData;
            }
            let query = SQLQueryPrama.SaveExternalIconQuery(externalIcon);
            KnexRaw.raw(query)
                .then(function (stylebyuserData) {
                    var _stylebyuserData = stylebyuserData;
                    JsonData._Issuccess = true;
                    JsonData.ExternalIcon = _stylebyuserData[0];
                    UtilityJs.CreateImage(JsonData.ExternalIcon);
                    JsonData.errormsg = "";
                    res.json(JsonData);
                }).catch(next);
        })
        .catch(next);
}

const GetExternalIcon = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        ExternalIcon: null,
        errormsg: '',
    }
    let query = SQLQueryPrama.GetAllExternalIcon(req.query);
    KnexRaw.raw(query)
        .then(function (stylebyuserData) {
            var _stylebyuserData = stylebyuserData;
            for (let i = 0; i < _stylebyuserData.length; i++) {
                let base64Image = _stylebyuserData[i].Icon.toString('base64');
                UtilityJs.ResizeImage(base64Image, 25, 25)
                    .then(resizedImageBuffer => {
                        let resizedImageData = resizedImageBuffer.toString('base64')
                        _stylebyuserData[i].Icon = resizedImageData;
                    }).catch(error => {
                        _stylebyuserData[i].Icon = base64Image;
                    });
            }
            JsonData._Issuccess = true;
            JsonData.ExternalIcon = _stylebyuserData;
            res.json(JsonData);
        }).catch(next);
}

const DeleteExternalSysmbols = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        ExternalIcon: null,
        errormsg: '',
    }
    let param = req.query;
    let query = SQLQueryPrama.DeleteExternalIcon(param);
    KnexRaw.raw(query)
        .then(function (data) {
            UtilityJs.DeleteExternalIconImage(param, function (err) {
                if (err) { JsonData.errormsg = err };
            });
            JsonData._Issuccess = true;
            JsonData.ExternalIcon = param;
            res.json(JsonData);
        }).catch(next);
}

const SavePrivateLayerStyles = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        errormsg: '',
        PrivateLayerStyles: null
    }
    let Getquery = SQLQueryPrama.GetPrivateLayerSaveStyleQuery(req.body);
    KnexRaw.raw(Getquery)
    .then(function (Data) {
        var SQLRes = Data;
        JsonData.PrivateLayerStyles = SQLRes[0];
        JsonData._Issuccess = true;
        res.json(JsonData);
    }).catch(next);
}

module.exports = {
    SaveLayerStyles,
    SaveCustomSymbols,
    GetExternalIcon,
    DeleteExternalSysmbols,
    SavePrivateLayerStyles
};