var logger = require("../Helper/logs");
const { EditableLayer, DrawTool, EditableLayers_SharedExcluded } = require('../Models');
let LayerQuery = require('../Helper/SqlQuery/LayerQuery');

const DrawToolsTestCall = (req, res, next) => {
    logger.detaillog("Draw Tools Controller Call successfully");
    res.json("Draw Tools Call successfully");
}

const GetDrawTools = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        DrawTools: null
    }
    let userId = req.query.UserId;
    EditableLayer.find({ UserGuid: userId, IsDeleted: 0 }).then(tools => {
        JsonData.DrawTools = tools;
        JsonData._Issuccess = true;
        res.json(JsonData);
    })
        .catch(next);
}

const GetDrawToolsItems = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        ToolsData: null
    }
    let layerId = req.query.LayerId;
    let query = LayerQuery.GetDrawingToolQuery(layerId);
    DrawTool.raw(query).then(tools => {
        JsonData.ToolsData = tools;
        JsonData._Issuccess = true;
        res.json(JsonData);
    })
        .catch(next);
}

const SaveEditableLayer = (req, res, next) => {
    let param = req.body;
    let editableLayer = param.editableLayer;
    editableLayer['CreatedTime'] = new Date().toISOString();
    editableLayer['IsDeleted'] = 0;
    editableLayer['isShared'] = editableLayer.isShared ? 1 : 0;
    if (param.LayerId != 0) {
        let layers = param.layers;
        for (let i = 0; i < layers.length; i++) {
            let layer = layers[i];
            layer['HTML_EditableLayerID'] = param.LayerId;
        }
        DrawTool.bulkSave(layers)
            .then(child => {
                res.json({ _Issuccess: true });
            })
            .catch(next);
    } else {
        EditableLayer.find({ UserGuid: editableLayer.UserGuid, IsDeleted: 0, Name: editableLayer.Name })
            .then(items => {
                if (items && items.length == 0) {
                    EditableLayer.save(editableLayer)
                        .then(data => {
                            if (data && data.length > 0) {
                                let layers = param.layers;
                                for (let i = 0; i < layers.length; i++) {
                                    let layer = layers[i];
                                    layer['HTML_EditableLayerID'] = data[0].EditableLayerID;
                                }
                                DrawTool.bulkSave(layers)
                                    .then(child => {
                                        res.json({ _Issuccess: true, layer: data[0] });
                                    })
                                    .catch(next);
                            } else {
                                res.json({ _Issuccess: false });
                            }
                        })
                        .catch(next);
                } else {
                    res.json({ _Issuccess: false, errMsg: 'Layer Name Already Exists' });
                }
            })
            .catch(next);

    }

}

const DeleteEditableLayer = (req, res, next) => {
    let layerId = req.query.LayerId;
    EditableLayer.update({ EditableLayerID: layerId }, { IsDeleted: 1 })
        .then(layer => {
            DrawTool.update({ HTML_EditableLayerID: layerId }, { IsDeleted: 1 })
                .then(tools => {
                    res.json({ _Issuccess: true });
                })
                .catch(next);
        })
        .catch(next);
}

const DeleteSelectedDrawItem = (req, res, next) => {
    let DrawItemId = req.query.DrawItemId;
    DrawTool.update({ Id: DrawItemId }, { IsDeleted: 1 })
        .then(tools => {
            res.json({ _Issuccess: true });
        })
        .catch(next);
}

const UpdateDrawingLayer = (req, res, next) => {
    let param = req.body;
    let editableLayer = param.editableLayer;
    let query = LayerQuery.CheckLayerNameInDrawingLayerExistsOrNotQuery(param);
    EditableLayer.raw(query)
        .then(items => {
            if (items && items.length == 0) {
                delete editableLayer.UserGuid;
                editableLayer['isShared'] = editableLayer.isShared ? 1 : 0;
                EditableLayer.update({ EditableLayerID: param.layerID }, editableLayer)
                    .then(data => {
                        if (data && data.length > 0) {
                            let layers = param.layers;
                            var promises = [];
                            for (let i = 0; i < layers.length; i++) {
                                let layer = layers[i];
                                promises.push(UpdateDrawLayer(layer));
                            }
                            Promise.all(promises).then(function (updatedItems) {
                                res.json({ _Issuccess: true });
                            }, function (error) {
                                res.json({ _Issuccess: false });
                                console.log(error);
                            });
                        } else {
                            res.json({ _Issuccess: false });
                        }
                    })
                    .catch(next);
            } else {
                res.json({ _Issuccess: false, errMsg: 'Layer Name Already Exists' });
            }
        }).catch(next);
}

const GetSharedDrawLayers = (req, res, next) => {
    let UserId = req.query.UserId;
    let companyId = req.query.CustomerId;
    let usersQuery = LayerQuery.GetUserListbasedonCompanyId(UserId, companyId);
    EditableLayer.raw(usersQuery)
        .then(usersData => {
            if (usersData && usersData.length > 0) {
                let sharedLayerQuery = LayerQuery.GetSharedDrawingLayerQuery(usersData, UserId);
                EditableLayer.raw(sharedLayerQuery)
                    .then(layers => {
                        res.json({ _Issuccess: true, layers: layers });
                    })
                    .catch(next);
            } else {
                res.json({ _Issuccess: true, layers: [] });
            }
        })
        .catch(next);
}

const DeleteSharedLayer = (req, res, next) => {
    let data = req.body;
    data['IsDeleted'] = 1;  
    EditableLayers_SharedExcluded.save(data)
        .then(data => {
            res.json({ _Issuccess: true, data: data });
        })
        .catch(next);
}

function UpdateDrawLayer(layer) {
    return new Promise((resolve, reject) => {
        try {
            let id = layer.Id;
            delete layer.Id;
            DrawTool.update({ Id: id }, layer)
                .then(child => {
                    resolve(child);
                })
                .catch(err => { reject(err) });
        } catch (error) {
            console.log(error);
            resolve(layer);
        }
    });
}


module.exports = {
    DrawToolsTestCall,
    SaveEditableLayer,
    GetDrawTools,
    GetDrawToolsItems,
    DeleteEditableLayer,
    DeleteSelectedDrawItem,
    UpdateDrawingLayer,
    GetSharedDrawLayers,
    DeleteSharedLayer
};