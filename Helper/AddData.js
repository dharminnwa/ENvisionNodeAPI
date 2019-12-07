var UtilityJs = require("../Helper/Utility");
var logger = require("../Helper/logs");
var Busboy = require('busboy');
var http = require('http'),
    path = require('path'),
    os = require('os'),
    fs = require('fs');
var AddDataModel = require("../Models/Custom/AddDataModel");
var fs = require("fs");
var fsExtra = require("fs-extra");
var mkdirp = require('mkdirp');
var dotSpatial = require("../Helper/DotSpatial");
var SQLQueryPrama = require("./SqlQuery/AddDataQuery");
const { KnexRaw } = require('../Models');
var archiver = require('archiver');
var config = require('config');
const request = require('request');
var extract = require('extract-zip');
var CreateLogsHelper = require("../Helper/createLogs");
var WMSQueryPrama = require("../Helper/GetWMSQueryPrama");

module.exports =
    {
        UploadFileType: Object.freeze({ "Shape": 1, "KML": 2, "Coordinates": 3, "Image": 4, "Feeds": 5 }),
        UploadFiles: function (request, response, next) {
            var i = 0;
            var fileUploadModel = new AddDataModel.ShapeFileUpload();
            var seperator = ".";
            var directoryDate = new Date().getUTCFullYear() + seperator + new Date().getUTCMonth() + 1 + seperator + new Date().getUTCDate() + seperator + new Date().getUTCHours() + seperator + new Date().getUTCMinutes() + seperator + new Date().getUTCSeconds();
            var busboy = new Busboy({ headers: request.headers });
            busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
                if (fieldname.toLowerCase().startsWith("shapefiles")) {
                    fileType = module.exports.UploadFileType.Shape;
                    fileName = filename.split('.').slice(0, -1).join('.');
                    directoryPath = './UploadedFiles/ShapeFiles/';
                    directoryPath += directoryDate;
                }
                else if (fieldname.toLowerCase().startsWith("coordinates")) {
                    fileType = module.exports.UploadFileType.Coordinates;
                    fileName = filename.split('.').slice(0, -1).join('.');
                    directoryPath = './UploadedFiles/Coordinates/';
                    directoryPath += directoryDate;
                }
                else if (fieldname.toLowerCase().startsWith("kmls")) {
                    fileType = module.exports.UploadFileType.KML;
                    fileName = filename;
                    directoryPath = './UploadedFiles/Kmls/';
                    directoryPath += directoryDate;
                }
                if (!fs.existsSync(directoryPath)) {
                    mkdirp(directoryPath, function (error) {
                        if (error) console.error(error)
                        else {
                            var saveTo = path.join(directoryPath, filename);
                            file.pipe(fs.createWriteStream(saveTo, { mode: 0o755 }));
                        }
                    });
                }
                else {
                    var saveTo = path.join(directoryPath, filename);
                    file.pipe(fs.createWriteStream(saveTo, { mode: 0o755 }));
                }
            });
            busboy.on('field', function (key, value) {
                if (key === 'UserData') {
                    UserData = JSON.parse(value);
                }
            });
            busboy.on('finish', function () {
                if (fileName != "" && fileName != undefined && UserData != undefined && UserData != null && UserData != "" && directoryPath != "" && directoryPath != undefined && fileType != null && fileType != undefined) {
                    fileUploadModel.fileType = fileType;
                    var JsonData = {
                        _Issuccess: false,
                        result: null,
                        errorMsg: ''
                    }
                    //Shape File
                    if (fileUploadModel.fileType == module.exports.UploadFileType.Shape) {
                        module.exports.ReadDirectory(directoryPath).then(function (listOfFileSource) {
                            if (listOfFileSource.length > 0) {
                                module.exports.createLogsforUploadfiles(request, UserData.UserGuid, fileName + " - Successfully Processed.");
                                //Check Validation 
                                var shapeFileValidationMsg = ShapeValidation(listOfFileSource);
                                if (shapeFileValidationMsg == "") {
                                    // Check file projection
                                    let isFileIn1984Projection = false;
                                    var prjFile = [];
                                    listOfFileSource.map(function (e) {
                                        if (e.FileExtention.toLowerCase() == ".prj")
                                            prjFile.push(e);
                                    });
                                    if (prjFile.length > 0) {
                                        prjFile = prjFile[0];
                                        fs.readFile(prjFile.FilePath, "utf8", function (error, fileData) {
                                            if (error) {
                                                JsonData._Issuccess = false;
                                                JsonData.errorMsg = error;
                                                logger.error("CheckProjectionFileIn1984", "AddData", error);
                                                module.exports.RemoveAllUploadedFilesWithDirectory(directoryPath);
                                                module.exports.createLogsforUploadfiles(request, UserData.UserGuid, error);
                                                response.json(JsonData);
                                            }
                                            else {
                                                if ((fileData != "" && ((fileData.indexOf("PROJCS") > -1 && fileData.indexOf("PROJCS[\"GCS_WGS_1984\"") == -1) || (fileData.indexOf("GCS_WGS_1984") == -1)))) {
                                                    var data = {
                                                        DirectoryPath: directoryPath,
                                                        FileName: fileName + ".shp",
                                                    }
                                                    dotSpatial.ConvertShapeFile(data, function (error, result) {
                                                        if (error) {
                                                            JsonData._Issuccess = false;
                                                            JsonData.errorMsg = error;
                                                            logger.error("ConvertShapeFile", "AddData", error);
                                                            module.exports.RemoveAllUploadedFilesWithDirectory(directoryPath);
                                                            module.exports.createLogsforUploadfiles(request, UserData.UserGuid, "Failed to Convert GCS_WGS_1984 into Shape File.");
                                                            response.json(JsonData);
                                                        }
                                                        if (result)
                                                            isFileIn1984Projection = true;
                                                    });

                                                }
                                                else
                                                    isFileIn1984Projection = true;
                                                if (isFileIn1984Projection) {
                                                    // Create zip
                                                    var guid = UtilityJs.GenerateGUID();
                                                    var zipFilePath = path.join(directoryPath, guid + '.zip');
                                                    CreateZip(listOfFileSource, zipFilePath, guid).then(function (data) {
                                                        //Upload file to geoserver
                                                        module.exports.UploadShapeFileToWMS("BaseMaps", "PrivateLayers", zipFilePath, config.GEOServerRestApi.geoServerHostName, config.GEOServerRestApi.geoServerUserName, config.GEOServerRestApi.geoServerPassword).then(function (data) {
                                                            if (data.statusCode == 201) {
                                                                //Read shape file and get icon type and representation type.
                                                                module.exports.GetShapeTypeFromShapeFile(fileUploadModel, listOfFileSource);
                                                                //Get properties values
                                                                module.exports.GetPropertiesValues(guid.toLowerCase()).then(function (data) {
                                                                    var properties = {
                                                                        dbfProperties: "",
                                                                        detailPanelProperties: ""
                                                                    }
                                                                    if (data.featureTypes[0].properties.length > 0) {
                                                                        for (var property of data.featureTypes[0].properties) {
                                                                            if (property.name.toLowerCase() != "the_geom" && property.name.toLowerCase() != "gid") {
                                                                                properties.dbfProperties += property.name + ",";
                                                                                properties.detailPanelProperties += property.name + "=" + property.name + ",";
                                                                            }
                                                                        }
                                                                        properties.dbfProperties = properties.dbfProperties.substring(0, properties.dbfProperties.length - 1);
                                                                        properties.detailPanelProperties = properties.detailPanelProperties.substring(0, properties.detailPanelProperties.length - 1);
                                                                    }
                                                                    if (properties.dbfProperties != "" && properties.detailPanelProperties != "") {
                                                                        //Add to datasets
                                                                        let dataSet = module.exports.SetValueOfDataSet(guid, fileName + ".shp", fileUploadModel, UserData.UserGuid, ".zip", properties);
                                                                        let Getquery = SQLQueryPrama.SaveToDataSets(dataSet);
                                                                        KnexRaw.raw(Getquery).then(function (Data) {
                                                                            if (Data.length == 1) {
                                                                                //Remove uploaded files
                                                                                module.exports.RemoveAllUploadedFilesWithDirectory(directoryPath);
                                                                                var treeView = [];
                                                                                var treeChild = 0;
                                                                                var layerList = [];
                                                                                var id = Data[0].DataSetID;
                                                                                //Get all the layers data with it's parent layers
                                                                                module.exports.GetPrivateLayersTreeViewParent(next, id, treeView, treeChild, layerList, UserData.UserGuid).then(function (data) {
                                                                                    //Convert to tree data
                                                                                    var treeData = module.exports.ConvertToTreeDataForPrivateLayer(data.TreeView, data.LayerList, 0, UserData.UserGuid);
                                                                                    JsonData.result = { "TreeData": treeData, "MapLayers": data.LayerList };
                                                                                    JsonData._Issuccess = true;
                                                                                    module.exports.createLogsforUploadfiles(request, UserData.UserGuid, fileName + ".shp - Successfully uploaded.");
                                                                                    response.json(JsonData);
                                                                                }, function (error) {
                                                                                    JsonData._Issuccess = false;
                                                                                    JsonData.errorMsg = error;
                                                                                    logger.error("GetPrivateLayersTreeViewParent", "AddData", error);
                                                                                    module.exports.RemoveAllUploadedFilesWithDirectory(directoryPath);
                                                                                    module.exports.createLogsforUploadfiles(request, UserData.UserGuid, fileName + ".shp - Failed to Upload Shape File");
                                                                                    response.json(JsonData);
                                                                                });

                                                                            }
                                                                        }).catch(next);
                                                                    }
                                                                }, function (error) {
                                                                    JsonData._Issuccess = false;
                                                                    JsonData.errorMsg = error;
                                                                    logger.error("GetPropertiesValues", "AddData", error);
                                                                    module.exports.createLogsforUploadfiles(request, UserData.UserGuid, error.originalError.message);
                                                                    module.exports.RemoveAllUploadedFilesWithDirectory(directoryPath);
                                                                    response.json(JsonData);
                                                                });
                                                            }
                                                        }, function (error) {
                                                            JsonData._Issuccess = false;
                                                            JsonData.errorMsg = error;
                                                            logger.error("UploadShapeFileToWMS", "AddData", error);
                                                            module.exports.createLogsforUploadfiles(request, UserData.UserGuid, error.originalError.message);
                                                            module.exports.RemoveAllUploadedFilesWithDirectory(directoryPath);
                                                            response.json(JsonData);
                                                        });

                                                    }, function (error) {
                                                        JsonData._Issuccess = false;
                                                        JsonData.errorMsg = error;
                                                        logger.error("CreateZip", "AddData", error);
                                                        module.exports.RemoveAllUploadedFilesWithDirectory(directoryPath);
                                                        module.exports.createLogsforUploadfiles(request, UserData.UserGuid, fileName + "- Failed to Upload WMS server " + error.originalError.message);
                                                        response.json(JsonData);
                                                    });

                                                }
                                            }
                                        });
                                    }
                                }
                                else {
                                    JsonData._Issuccess = false;
                                    JsonData.errorMsg = shapeFileValidationMsg;
                                    module.exports.RemoveAllUploadedFilesWithDirectory(directoryPath);
                                    response.json(JsonData);
                                }
                            }
                        }, function (error) {
                            JsonData._Issuccess = false;
                            JsonData.errorMsg = error;
                            logger.error("ReadDirectory", "AddData", error);
                            module.exports.RemoveAllUploadedFilesWithDirectory(directoryPath);
                            module.exports.createLogsforUploadfiles(request, UserData.UserGuid, error.message);
                            response.json(JsonData);
                        });
                    }
                    //KML File
                    else if (fileUploadModel.fileType == module.exports.UploadFileType.KML) {
                        module.exports.MoveKmlFile(directoryPath, fileName).then(function (newDirectoryPath) {
                            if (newDirectoryPath) {
                                module.exports.createLogsforUploadfiles(request, UserData.UserGuid, fileName + " - Successfully Processed.");
                                module.exports.ReadDirectory(newDirectoryPath).then(function (listOfFileSource) {
                                    if (listOfFileSource.length > 0) {
                                        //Check Validation 
                                        var kmlFileValidationMsg = module.exports.KmlsFileValidation(listOfFileSource);
                                        if (kmlFileValidationMsg == "") {
                                            //Read shape file and get icon type and representation type.
                                            module.exports.GetShapeTypeFromShapeFile(fileUploadModel, listOfFileSource);
                                            var guid = UtilityJs.GenerateGUID();
                                            //Add to datasets
                                            let dataSet = module.exports.SetValueOfDataSet(guid, fileName, fileUploadModel, UserData.UserGuid, listOfFileSource[0].FileExtention, undefined, listOfFileSource[0].FilePath);
                                            let Getquery = SQLQueryPrama.SaveToDataSets(dataSet);
                                            KnexRaw.raw(Getquery).then(function (Data) {
                                                if (Data.length == 1) {
                                                    var treeView = [];
                                                    var treeChild = 0;
                                                    var layerList = [];
                                                    var id = Data[0].DataSetID;
                                                    //Get all the layers data with it's parent layers
                                                    module.exports.GetPrivateLayersTreeViewParent(next, id, treeView, treeChild, layerList, UserData.UserGuid).then(function (data) {
                                                        //Convert to tree data
                                                        var treeData = module.exports.ConvertToTreeDataForPrivateLayer(data.TreeView, data.LayerList, 0, UserData.UserGuid);
                                                        JsonData.result = { "TreeData": treeData, "MapLayers": data.LayerList };
                                                        JsonData._Issuccess = true;
                                                        module.exports.createLogsforUploadfiles(request, UserData.UserGuid, fileName + " - Successfully uploaded.");
                                                        response.json(JsonData);
                                                    }, function (error) {
                                                        JsonData._Issuccess = false;
                                                        JsonData.errorMsg = error;
                                                        logger.error("GetPrivateLayersTreeViewParent", "AddData", error);
                                                        module.exports.createLogsforUploadfiles(request, UserData.UserGuid, fileName + " - Failed to Upload KML/KMZ File. " + error.message);
                                                        module.exports.RemoveAllUploadedFilesWithDirectory(newDirectoryPath);
                                                        response.json(JsonData);
                                                    });
                                                }
                                            }).catch(next);
                                        } else {
                                            JsonData._Issuccess = false;
                                            JsonData.errorMsg = kmlFileValidationMsg;
                                            module.exports.RemoveAllUploadedFilesWithDirectory(directoryPath);
                                            response.json(JsonData);
                                        }
                                    }
                                }, function (error) {
                                    JsonData._Issuccess = false;
                                    JsonData.errorMsg = error;
                                    logger.error("ReadDirectory", "AddData", error);
                                    module.exports.createLogsforUploadfiles(request, UserData.UserGuid, fileName + " - Failed ReadDirectory while uploading files. " + + error.message);
                                    module.exports.RemoveAllUploadedFilesWithDirectory(newDirectoryPath);
                                    response.json(JsonData);
                                });
                            }
                        }, function (error) {
                            JsonData._Issuccess = false;
                            JsonData.errorMsg = error;
                            logger.error("MoveKmlFile", "AddData", error);
                            module.exports.createLogsforUploadfiles(request, UserData.UserGuid, fileName + " - Failed to MoveKmlFile. " + error);
                            module.exports.RemoveAllUploadedFilesWithDirectory(directoryPath);
                            response.json(JsonData);
                        });
                    }
                    //Coordinates File
                    else if (fileUploadModel.fileType == module.exports.UploadFileType.Coordinates) {
                        module.exports.ReadDirectory(directoryPath).then(function (listOfFileSource) {
                            setTimeout(function () {
                                module.exports.createLogsforUploadfiles(request, UserData.UserGuid, fileName + " - Successfully Processed.");
                                if (listOfFileSource.length > 0) {
                                    var coordinatesFileValidationMsg = module.exports.CoordinatesFileValidation(listOfFileSource);
                                    if (coordinatesFileValidationMsg == "") {
                                        var shapefilepath = './UploadedFiles/ShapeFiles/';
                                        shapefilepath += directoryDate;
                                        var inputData = {
                                            UploadedFilePath: listOfFileSource[0].FilePath,
                                            FileName: listOfFileSource[0].FileName + listOfFileSource[0].FileExtention,
                                            ShapeFilePath: shapefilepath,
                                            UploadedDirectoryPath: directoryPath
                                        }
                                        //Read excel and create a shape file
                                        dotSpatial.ReadExcelAndCreateShapefile(inputData, function (error, result) {
                                            if (error) {
                                                JsonData._Issuccess = false;
                                                JsonData.errorMsg = error;
                                                logger.error("ReadExcelAndCreateShapefile", "AddData", error);
                                                module.exports.createLogsforUploadfiles(request, UserData.UserGuid, fileName + " - Failed to Convert Excel Data into Shape File. " + error.message);
                                                //module.exports.RemoveAllUploadedFilesWithDirectory(directoryPath);
                                                response.json(JsonData);
                                            }
                                            if (result) {
                                                if (result.isSuccess && result.errorMessage == "") {
                                                    module.exports.ReadDirectory(shapefilepath).then(function (listTypeShapeFile) {
                                                        // Create zip
                                                        var guid = UtilityJs.GenerateGUID();
                                                        var zipFilePath = path.join(shapefilepath, guid + '.zip');
                                                        CreateZip(listTypeShapeFile, zipFilePath, guid).then(function (data) {
                                                            //Upload file to geoserver
                                                            module.exports.UploadShapeFileToWMS("BaseMaps", "PrivateLayers", zipFilePath, config.GEOServerRestApi.geoServerHostName, config.GEOServerRestApi.geoServerUserName, config.GEOServerRestApi.geoServerPassword).then(function (data) {
                                                                if (data.statusCode == 201) {
                                                                    //Read shape file and get icon type and representation type.
                                                                    module.exports.GetShapeTypeFromShapeFile(fileUploadModel, listTypeShapeFile);
                                                                    //Get properties values
                                                                    module.exports.GetPropertiesValues(guid.toLowerCase()).then(function (data) {
                                                                        var properties = {
                                                                            dbfProperties: "",
                                                                            detailPanelProperties: ""
                                                                        }
                                                                        if (data.featureTypes[0].properties.length > 0) {
                                                                            for (var property of data.featureTypes[0].properties) {
                                                                                if (property.name.toLowerCase() != "the_geom" && property.name.toLowerCase() != "gid") {
                                                                                    properties.dbfProperties += property.name + ",";
                                                                                    properties.detailPanelProperties += property.name + "=" + property.name + ",";
                                                                                }
                                                                            }
                                                                            properties.dbfProperties = properties.dbfProperties.substring(0, properties.dbfProperties.length - 1);
                                                                            properties.detailPanelProperties = properties.detailPanelProperties.substring(0, properties.detailPanelProperties.length - 1);
                                                                        }
                                                                        if (properties.dbfProperties != "" && properties.detailPanelProperties != "") {
                                                                            //Add to datasets
                                                                            let dataSet = module.exports.SetValueOfDataSet(guid, fileName + ".shp", fileUploadModel, UserData.UserGuid, listOfFileSource[0].FileExtention, properties);
                                                                            let Getquery = SQLQueryPrama.SaveToDataSets(dataSet);
                                                                            KnexRaw.raw(Getquery).then(function (Data) {
                                                                                if (Data.length == 1) {
                                                                                    //Remove uploaded files
                                                                                    module.exports.RemoveAllUploadedFilesWithDirectory(shapefilepath);
                                                                                    var treeView = [];
                                                                                    var treeChild = 0;
                                                                                    var layerList = [];
                                                                                    var id = Data[0].DataSetID;
                                                                                    //Get all the layers data with it's parent layers
                                                                                    module.exports.GetPrivateLayersTreeViewParent(next, id, treeView, treeChild, layerList, UserData.UserGuid).then(function (data) {
                                                                                        //Convert to tree data
                                                                                        var treeData = module.exports.ConvertToTreeDataForPrivateLayer(data.TreeView, data.LayerList, 0, UserData.UserGuid);
                                                                                        JsonData.result = { "TreeData": treeData, "MapLayers": data.LayerList };
                                                                                        JsonData._Issuccess = true;
                                                                                        module.exports.createLogsforUploadfiles(request, UserData.UserGuid, fileName + " - Successfully uploaded.");
                                                                                        response.json(JsonData);
                                                                                    }, function (error) {
                                                                                        JsonData._Issuccess = false;
                                                                                        JsonData.errorMsg = error;
                                                                                        logger.error("GetPrivateLayersTreeViewParent", "AddData", error);
                                                                                        module.exports.createLogsforUploadfiles(request, UserData.UserGuid, fileName + " - Failed to Convert Excel Data into Shape File.");
                                                                                        module.exports.RemoveAllUploadedFilesWithDirectory(shapefilepath);
                                                                                        response.json(JsonData);
                                                                                    });
                                                                                }
                                                                            }).catch(next);
                                                                        }
                                                                    }, function (error) {
                                                                        JsonData._Issuccess = false;
                                                                        JsonData.errorMsg = error;
                                                                        logger.error("GetPropertiesValues", "AddData", error);
                                                                        module.exports.RemoveAllUploadedFilesWithDirectory(shapefilepath);
                                                                        response.json(JsonData);
                                                                    });
                                                                }
                                                            }, function (error) {
                                                                JsonData._Issuccess = false;
                                                                JsonData.errorMsg = error;
                                                                logger.error("UploadShapeFileToWMS", "AddData", error);
                                                                module.exports.RemoveAllUploadedFilesWithDirectory(shapefilepath);
                                                                response.json(JsonData);
                                                            });

                                                        }, function (error) {
                                                            JsonData._Issuccess = false;
                                                            JsonData.errorMsg = error;
                                                            logger.error("CreateZip", "AddData", error);
                                                            module.exports.RemoveAllUploadedFilesWithDirectory(shapefilepath);
                                                            response.json(JsonData);
                                                        });
                                                    }, function (error) {
                                                        JsonData._Issuccess = false;
                                                        JsonData.errorMsg = error;
                                                        logger.error("ReadDirectory", "AddData", error);
                                                        module.exports.RemoveAllUploadedFilesWithDirectory(shapefilepath);
                                                        response.json(JsonData);
                                                    });

                                                }
                                            }
                                        });
                                    } else {
                                        JsonData._Issuccess = false;
                                        JsonData.errorMsg = coordinatesFileValidationMsg;
                                        module.exports.RemoveAllUploadedFilesWithDirectory(directoryPath);
                                        response.json(JsonData);
                                    }
                                }
                            }, 3000);
                        }, function (error) {
                            JsonData._Issuccess = false;
                            JsonData.errorMsg = error;
                            logger.error("ReadDirectory", "AddData", error);
                            module.exports.RemoveAllUploadedFilesWithDirectory(directoryPath);
                            response.json(JsonData);
                        });
                    }
                }
            });
            return request.pipe(busboy);
        },

        GetShapeTypeFromShapeFile: function (fileUploadModel, listOfFileSource) {
            switch (fileUploadModel.fileType) {
                case module.exports.UploadFileType.Shape:
                case module.exports.UploadFileType.Coordinates:
                    var shpFile = [];
                    listOfFileSource.map(function (e) {
                        if (e.FileExtention.toLowerCase() == ".shp")
                            shpFile.push(e);
                    });
                    if (shpFile.length > 0) {
                        dotSpatial.ReadShapeFileAndGetShapeType(shpFile[0].FilePath, function (error, result) {
                            if (error) {
                                logger.error("ReadShapeFileAndGetShapeType", "AddData", error);
                            }
                            else {
                                switch (result) {
                                    case 1:
                                        fileUploadModel.IconType = "Circle";
                                        fileUploadModel.RepresentationType = "Point";
                                        break;

                                    case 3:
                                    case 13:
                                    case 23:
                                        fileUploadModel.IconType = "Line";
                                        fileUploadModel.RepresentationType = "Line";
                                        break;

                                    case 5:
                                        fileUploadModel.IconType = "RoundedRectangle";
                                        fileUploadModel.RepresentationType = "Area";
                                        break;

                                    default:
                                        fileUploadModel.IconType = "Circle";
                                        fileUploadModel.RepresentationType = "Point";
                                        break;

                                }
                            }
                        });
                    }
                    break;
                case module.exports.UploadFileType.KML:
                    fileUploadModel.IconType = "Circle";
                    fileUploadModel.RepresentationType = "Point";
                    break;
            }
        },

        SetValueOfDataSet: function (zipFileName, fileName, fileUploadModel, userId, fileExtention, properties, kmlFilePath) {
            var dataSet = new AddDataModel.DataSet();
            dataSet.DataSetName = fileName.replace('.zip', '').replace('.shp', '');
            dataSet.Description = null//fileUploadModel.ShapeDescription == undefined || fileUploadModel.ShapeDescription == "" ? null : fileUploadModel.ShapeDescription;
            dataSet.UploadedBy = userId;
            dataSet.PublishedDate = null;
            dataSet.Source = null;
            dataSet.Citation = null;
            dataSet.Tags = fileName.replace('.zip', '').replace('.shp', '') + " " + ((fileUploadModel.ShapeDescription == "" || fileUploadModel.ShapeDescription == undefined) ? "" : fileUploadModel.ShapeDescription);
            dataSet.Attributes = null;
            dataSet.IsPublic = false;
            dataSet.PreviewImage = "http://mapsearch360.com/images/datasetimage.png";
            dataSet.FilesIncluded = null;
            dataSet.IconType = fileUploadModel.IconType;
            dataSet.RepresentationType = fileUploadModel.RepresentationType;
            dataSet.StrokeThicknessPercent = 10;
            var colors = ["#ff32cd32", "#ff0000ff", "#ffffff00", "#ff00ffff",
                "#ff8a2be2", "#ffa52a2a", "#ff7fff00", "#ffff7f50", "#ffff8c00", "#ff006400", "#fff08080",
                "#ff800000", "#ff808000", "#ffffa500", "#ffff4500", "#ff9acd32", "#ffffff00"];
            dataSet.StrokeColor = "#ff2e8b57";
            dataSet.FillColor = colors[Math.floor(Math.random() * colors.length)];
            dataSet.SizePercent = 70;
            dataSet.Opacity = 1;
            dataSet.IsEnabled = true;
            dataSet.SortNumber = 1;
            dataSet.DataSetGUID = zipFileName.toUpperCase();
            dataSet.IsSaveSearch = false;
            dataSet.LayerTypeID = 9;
            dataSet.TableName = dataSet.DataSetGUID;
            dataSet.UploadFileType = fileExtention;
            dataSet.FilePathLocation = "";
            dataSet.DBFProperties = null;
            dataSet.DetailPanelProperties = null;
            if (properties && properties.dbfProperties != "" && properties.detailPanelProperties != "") {
                dataSet.DBFProperties = properties.dbfProperties;
                dataSet.DetailPanelProperties = properties.detailPanelProperties;
            }
            if (fileUploadModel.fileType == module.exports.UploadFileType.KML) {
                if (kmlFilePath && kmlFilePath != null) {
                    dataSet.FilePathLocation = kmlFilePath.replace("UploadedFiles\\Kmls\\", "");
                    dataSet.TableName = null;
                }
            }
            return dataSet;
        },

        RemoveAllUploadedFiles: function (listOfFileSource) {
            for (var i = 0; i < listOfFileSource.length; i++) {
                fs.unlinkSync(listOfFileSource[i].FilePath);
            }

        },

        UploadShapeFileToWMS: function (workspace, dsName, zipUri, hostName, userName, password) {
            return new Promise((resolve, reject) => {
                var req = http.request({
                    hostname: hostName,
                    path: "/geoserver/rest/workspaces/" + workspace + "/datastores/" + dsName + "/" + "file.shp",
                    port: 8080,
                    method: 'PUT',
                    timeout: 120000000,
                    headers: {
                        'Content-Type': 'application/zip',
                        'Authorization': 'Basic ' + new Buffer.from(userName + ':' + password).toString('base64')
                    }
                });
                req.on('error', err => reject(err));
                req.on('response', res => resolve(res));
                fs.createReadStream(zipUri).pipe(req);
            })

        },

        RemoveAllUploadedFilesWithDirectory: function (path) {
            try {
                if (fs.existsSync(path)) {
                    fsExtra.remove(path);
                }
            }
            catch (err) {
                console.log(err);
            }
        },

        GetPropertiesValues: function (layerName) {
            var url = config.GEOServerUrl.wfsUrl;
            url += "?service=WFS&version=1.0.0&request=describeFeatureType&typeName=BaseMaps:" + layerName + "&outputFormat=application/json";
            return new Promise((resolve, reject) => {
                request(url, function (error, response, body) {
                    if (error)
                        return reject(error)
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        reject(e);
                    }
                });
            })
        },

        GetPrivateLayersTreeViewParent: function (next, layerId, treeView, treeChild, layerList, userId) {
            return new Promise((resolve, reject) => {
                let Getquery = SQLQueryPrama.GetPrivateLayerById(layerId);
                KnexRaw.raw(Getquery).then(function (privateLayerData) {
                    let GeLayerFiltertquery = SQLQueryPrama.GetLayerGridFilters(layerId, userId);
                    KnexRaw.raw(GeLayerFiltertquery).then(function (layerFilterData) {
                        if (privateLayerData.length == 1) {
                            if (layerFilterData.length > 0)
                                privateLayerData[0].LayerGridFilterModel = layerFilterData;
                            else
                                privateLayerData[0].LayerGridFilterModel = [];
                            var layerInfo = privateLayerData[0];
                            var existingLayer = [];
                            treeView.map(function (e) {
                                if (e.DataSetID == layerInfo.DataSetID)
                                    existingLayer.push(e);
                            });
                            if (existingLayer.length == 0) {
                                if (layerInfo.IconType.toLowerCase() == "roundedrectanglearea")
                                    layerInfo.IconType = layerInfo.IconType.Replace("Area", "");
                                // if (layerInfo.RepresentationType == "Area")
                                //     layerInfo.SizePercent = 100;
                                module.exports.GetIconUrl(next, layerInfo, userId).then(function (iconURL) {
                                    var layerTreeViewItem = {
                                        "id": layerInfo.DataSetID,
                                        "parent": layerInfo.ParentDataSetID,
                                        "text": layerInfo.DataSetName,
                                        "icon": iconURL
                                    }
                                    treeView.push(layerTreeViewItem);
                                    if (treeChild == 0) {
                                        treeChild++;
                                        var ids = [];
                                        ids.push(layerId);
                                        let Getquery = SQLQueryPrama.GetPrivateLayerParentsById(layerId);
                                        KnexRaw.raw(Getquery).then(function (data) {
                                            if (data.length > 0) {
                                                var layerIds = [];
                                                for (var layer of data) {
                                                    layerIds.push(layer.DataSetID);
                                                }
                                                let Getquery = SQLQueryPrama.GetLayerGridFilters(layerIds.toString(), userId);
                                                KnexRaw.raw(Getquery).then(function (layerGridFilterData) {
                                                    data.map(function (e) {
                                                        if (!e.LayerGridFilterModel)
                                                            e.LayerGridFilterModel = [];
                                                    });
                                                    if (layerGridFilterData.length > 0) {
                                                        for (var filter of layerGridFilterData) {
                                                            var selectedLayer = [];
                                                            data.map(function (e) {
                                                                if (filter.LayerId == e.DataSetID)
                                                                    selectedLayer.push(e);
                                                            });
                                                            if (selectedLayer.length == 1) {
                                                                //if (!selectedLayer[0].LayerGridFilterModel)
                                                                if (selectedLayer[0].LayerGridFilterModel.length > 0)
                                                                    selectedLayer[0].LayerGridFilterModel.push(filter);
                                                                else
                                                                    selectedLayer[0].LayerGridFilterModel = [filter];
                                                            }
                                                        }
                                                    }

                                                    layerList = data;
                                                    var promises = [];
                                                    for (var item of data) {
                                                        if (item.DataSetID != layerId) {
                                                            if (item.IconType.toLowerCase() == "roundedrectanglearea")
                                                                item.IconType = item.IconType.Replace("Area", "");
                                                            // if (layerInfo.RepresentationType == "Area")
                                                            //     layerInfo.SizePercent = 100;
                                                            promises.push(module.exports.GetIconUrl(next, item, userId));
                                                        }
                                                    }
                                                    Promise.all(promises).then(function (data) {
                                                        for (var item of layerList) {
                                                            var iconURL = [];
                                                            data.map(function (e) {
                                                                if (e.indexOf("Id=" + item.DataSetID) != -1)
                                                                    iconURL.push(e);
                                                            });
                                                            if (iconURL.length > 0) {
                                                                var layerTreeViewItem = {
                                                                    "id": item.DataSetID,
                                                                    "parent": item.ParentDataSetID,
                                                                    "text": item.DataSetName,
                                                                    "icon": iconURL[0]
                                                                }
                                                                treeView.push(layerTreeViewItem);
                                                            }
                                                        }
                                                        if (layerInfo.ParentDataSetID != null)
                                                            module.exports.GetPrivateLayersTreeViewParent(next, layerInfo.ParentDataSetID, treeView, treeChild, layerList, userId).then(function (layerData) { resolve(layerData); }, function (error) { return reject(error); });
                                                        else {
                                                            var layerData = {
                                                                "TreeView": treeView,
                                                                "LayerList": layerList
                                                            }
                                                            resolve(layerData);
                                                        }
                                                    }, function (error) {
                                                        return reject(error);
                                                    });

                                                }, function (error) {
                                                    return reject(error);
                                                });


                                            }
                                            else {
                                                layerList.push(privateLayerData[0]);
                                                if (layerInfo.ParentDataSetID != null)
                                                    module.exports.GetPrivateLayersTreeViewParent(next, layerInfo.ParentDataSetID, treeView, treeChild, layerList, userId).then(function (layerData) { resolve(layerData); }, function (error) { return reject(error); });
                                                else {
                                                    var layerData = {
                                                        "TreeView": treeView,
                                                        "LayerList": layerList
                                                    }
                                                    resolve(layerData);
                                                }
                                            }
                                        }, function (error) {
                                            return reject(error);
                                        }).catch(next);
                                    }
                                    else {
                                        if (layerInfo.ParentDataSetID != null)
                                            module.exports.GetPrivateLayersTreeViewParent(next, layerInfo.ParentDataSetID, treeView, treeChild, layerList, userId).then(function (layerData) { resolve(layerData); }, function (error) { return reject(error); });
                                        else {
                                            var layerData = {
                                                "TreeView": treeView,
                                                "LayerList": layerList
                                            }
                                            resolve(layerData);
                                        }
                                    }
                                }, function (error) {
                                    return reject(error);
                                })
                            }
                        }
                    }, function (error) {
                        return reject(error);
                    }).catch(next);
                }, function (error) {
                    return reject(error);
                }).catch(next);
            });
        },

        GetPrivateGroupLayersTreeViewParent: function (next, layerId, childIds, treeView, treeChild, layerList, userId) {
            return new Promise((resolve, reject) => {
                let Getquery = SQLQueryPrama.GetPrivateLayerById(layerId);
                KnexRaw.raw(Getquery).then(function (privateLayerData) {
                    let GeLayerFiltertquery = SQLQueryPrama.GetLayerGridFilters(layerId, userId);
                    KnexRaw.raw(GeLayerFiltertquery).then(function (layerFilterData) {
                        if (privateLayerData.length == 1) {
                            if (layerFilterData.length > 0)
                                privateLayerData[0].LayerGridFilterModel = layerFilterData;
                            else
                                privateLayerData[0].LayerGridFilterModel = [];
                            var layerInfo = privateLayerData[0];
                            var existingLayer = [];
                            treeView.map(function (e) {
                                if (e.DataSetID == layerInfo.DataSetID)
                                    existingLayer.push(e);
                            });
                            if (existingLayer.length == 0) {
                                if (layerInfo.IconType.toLowerCase() == "roundedrectanglearea")
                                    layerInfo.IconType = layerInfo.IconType.Replace("Area", "");
                                // if (layerInfo.RepresentationType == "Area")
                                //     layerInfo.SizePercent = 100;
                                module.exports.GetIconUrl(next, layerInfo, userId).then(function (iconURL) {
                                    var layerTreeViewItem = {
                                        "id": layerInfo.DataSetID,
                                        "parent": layerInfo.ParentDataSetID,
                                        "text": layerInfo.DataSetName,
                                        "icon": iconURL
                                    }
                                    treeView.push(layerTreeViewItem);
                                    if (treeChild == 0) {
                                        treeChild++;
                                        var ids = [];
                                        ids.push(layerId);
                                        if (childIds)
                                            var Getquery = SQLQueryPrama.GetPrivateGroupLayerParentsById(layerId, childIds);
                                        else
                                            var Getquery = SQLQueryPrama.GetPrivateLayerParentsById(layerId);
                                        KnexRaw.raw(Getquery).then(function (data) {
                                            if (data.length > 0) {
                                                var layerIds = [];
                                                for (var layer of data) {
                                                    layerIds.push(layer.DataSetID);
                                                }
                                                let Getquery = SQLQueryPrama.GetLayerGridFilters(layerIds.toString(), userId);
                                                KnexRaw.raw(Getquery).then(function (layerGridFilterData) {
                                                    data.map(function (e) {
                                                        if (!e.LayerGridFilterModel)
                                                            e.LayerGridFilterModel = [];
                                                    });
                                                    if (layerGridFilterData.length > 0) {
                                                        for (var filter of layerGridFilterData) {
                                                            var selectedLayer = [];
                                                            data.map(function (e) {
                                                                if (filter.LayerId == e.DataSetID)
                                                                    selectedLayer.push(e);
                                                            });
                                                            if (selectedLayer.length == 1) {
                                                                //if (!selectedLayer[0].LayerGridFilterModel)
                                                                if (selectedLayer[0].LayerGridFilterModel.length > 0)
                                                                    selectedLayer[0].LayerGridFilterModel.push(filter);
                                                                else
                                                                    selectedLayer[0].LayerGridFilterModel = [filter];
                                                            }
                                                        }
                                                    }


                                                    layerList = data;
                                                    var promises = [];
                                                    for (var item of data) {
                                                        if (item.DataSetID != layerId) {
                                                            if (item.IconType.toLowerCase() == "roundedrectanglearea")
                                                                item.IconType = item.IconType.Replace("Area", "");
                                                            // if (layerInfo.RepresentationType == "Area")
                                                            //     layerInfo.SizePercent = 100;
                                                            promises.push(module.exports.GetIconUrl(next, item, userId));
                                                        }
                                                    }
                                                    Promise.all(promises).then(function (data) {
                                                        for (var item of layerList) {
                                                            var iconURL = [];
                                                            data.map(function (e) {
                                                                if (e.indexOf("Id=" + item.DataSetID) != -1)
                                                                    iconURL.push(e);
                                                            });
                                                            if (iconURL.length > 0) {
                                                                var layerTreeViewItem = {
                                                                    "id": item.DataSetID,
                                                                    "parent": item.ParentDataSetID,
                                                                    "text": item.DataSetName,
                                                                    "icon": iconURL[0]
                                                                }
                                                                treeView.push(layerTreeViewItem);
                                                            }
                                                        }
                                                        if (layerInfo.ParentDataSetID != null)
                                                            module.exports.GetPrivateGroupLayersTreeViewParent(next, layerInfo.ParentDataSetID, null, treeView, treeChild, layerList, userId).then(function (layerData) { resolve(layerData); }, function (error) { return reject(error); });
                                                        else {
                                                            var layerData = {
                                                                "TreeView": treeView,
                                                                "LayerList": layerList
                                                            }
                                                            resolve(layerData);
                                                        }
                                                    }, function (error) {
                                                        return reject(error);
                                                    });
                                                }, function (error) {
                                                    return reject(error);
                                                });
                                            }
                                            else {
                                                layerList.push(privateLayerData[0]);
                                                if (layerInfo.ParentDataSetID != null)
                                                    module.exports.GetPrivateGroupLayersTreeViewParent(next, layerInfo.ParentDataSetID, null, treeView, treeChild, layerList, userId).then(function (layerData) { resolve(layerData); }, function (error) { return reject(error); });
                                                else {
                                                    var layerData = {
                                                        "TreeView": treeView,
                                                        "LayerList": layerList
                                                    }
                                                    resolve(layerData);
                                                }
                                            }
                                        }, function (error) {
                                            return reject(error);
                                        }).catch(next);
                                    }
                                    else {
                                        if (layerInfo.ParentDataSetID != null)
                                            module.exports.GetPrivateLayersTreeViewParent(next, layerInfo.ParentDataSetID, treeView, treeChild, layerList, userId).then(function (layerData) { resolve(layerData); }, function (error) { return reject(error); });
                                        else {
                                            var layerData = {
                                                "TreeView": treeView,
                                                "LayerList": layerList
                                            }
                                            resolve(layerData);
                                        }
                                    }
                                }, function (error) {
                                    return reject(error);
                                })
                            }
                        }
                    }, function (error) {
                        return reject(error);
                    }).catch(next);
                }, function (error) {
                    return reject(error);
                }).catch(next);
            });
        },

        GetIconUrl: function (next, layerInfo, userId) {
            return new Promise((resolve, reject) => {
                var promises = [];
                if (layerInfo.ExternalIconId == null) {
                    resolve(config.ImagePath.iconImageURL + layerInfo.DataSetID + "&URLType=CustomStyleIcon&FillColor=" + layerInfo.FillColor.replace("#", "") + "&IconType=" + layerInfo.IconType + "&StrokeColor=" + layerInfo.StrokeColor.replace("#", "") + "&SizePercent=" + layerInfo.SizePercent + "&StrokeThicknessPercent=" + layerInfo.StrokeThicknessPercent + "&Opacity=" + layerInfo.Opacity);
                }
                else {
                    var iconId = layerInfo.ExternalIconId;
                    var URL = UtilityJs.GetDefaultExternalIcon(iconId);
                    if (URL == "") {
                        let Getquery = SQLQueryPrama.GetExternalIcon(userId, iconId);
                        KnexRaw.raw(Getquery).then(function (data) {
                            if (data.length == 1) {
                                var icon = data[0];
                                let imagePath = config.ImagePath.UploadExternalIcon;
                                imagePath += "/" + icon.UploadedBy;
                                if (!fs.existsSync(imagePath)) {
                                    promises.push(UtilityJs.makeDirectoryByPath(imagePath));
                                    Promise.all(promises).then(function (data) {
                                        imagePath += "/" + icon.Id + icon.Extension.trim();
                                        fs.writeFile(imagePath, icon.Icon, 'base64', (error) => {
                                            if (error) reject(error);
                                            else resolve(config.ImagePath.externalUserImage + icon.UploadedBy + "/" + icon.Id + icon.Extension.trim());
                                        });
                                    },
                                        function (error) {
                                            reject(error);
                                        });
                                }
                                else {
                                    imagePath += "/" + icon.Id + icon.Extension.trim();
                                    fs.writeFile(imagePath, icon.Icon, 'base64', (error) => {
                                        if (error) reject(error);
                                        else resolve(config.ImagePath.externalUserImage + icon.UploadedBy + "/" + icon.Id + icon.Extension.trim());
                                    });
                                }
                            }
                            else
                                resolve(config.ImagePath.externalImage + "95.png");
                        }, function (error) {
                            reject(error);
                        }).catch(next);
                    }
                    else
                        resolve(URL);
                }
            });
        },

        GetPropertyNames: function (param) {
            return new Promise((resolve, reject) => {
                let URL = WMSQueryPrama.WFSGetFeaturetype(param);
                request(URL, { json: true }, (error, responce, body) => {
                    if (error || !responce.body["featureTypes"]) {
                        reject(error);
                        logger.error("GetPropertyNames", "AddData", error);
                    }
                    if (responce.body["featureTypes"] && responce.body["featureTypes"].length > 0 && responce.body["featureTypes"][0].properties.length > 0) {
                        let fields = responce.body["featureTypes"][0].properties.map(f => f.name);
                        let result = {
                            TableName: param.energyLayer.TableName,
                            DataSetID: param.energyLayer.DataSetID,
                            Fields: fields
                        }
                        resolve(result);
                    }
                    else {
                        let result = {
                        }
                        reject(result);
                    }
                });
            });
        },

        ConvertToTreeDataForPrivateLayer: function (treeLayers, mapLayers, customMapId, userId) {
            var treeData = [];
            if (mapLayers.length > 0) {
                var listChildNode = [];
                var listParentNode = [];
                var listParentParentNode = [];
                var treeLayer = null;
                var parentLayer = null;
                var parentParentLayer = null;
                var parentParentParentLayer = null;

                var tLayer = [];
                treeLayers.map(function (e) {
                    if (e.id == mapLayers[0].DataSetID)
                        tLayer.push(e);
                });
                if (tLayer.length == 1) { treeLayer = tLayer[0]; }

                if (treeLayer != null) {
                    var pLayer = [];
                    treeLayers.map(function (e) {
                        if (e.id == treeLayer.parent)
                            pLayer.push(e);
                    });
                    if (pLayer.length == 1) { parentLayer = pLayer[0]; }
                }

                if (parentLayer != null) {
                    var ppLayer = [];
                    treeLayers.map(function (e) {
                        if (e.id == parentLayer.parent)
                            ppLayer.push(e);
                    });
                    if (ppLayer.length == 1) { parentParentLayer = ppLayer[0]; }
                }

                if (parentParentLayer != null) {
                    var pppLayer = [];
                    treeLayers.map(function (e) {
                        if (e.id == parentParentLayer.parent)
                            pppLayer.push(e);
                    });
                    if (pppLayer.length == 1) { parentParentParentLayer = pppLayer[0]; }
                }

                let isPrivateLayer = false;
                for (var mapLayer of mapLayers) {
                    var treeMapLayer = [];
                    treeLayers.map(function (e) {
                        if (e.id == mapLayer.DataSetID)
                            treeMapLayer.push(e);
                    });
                    if (treeMapLayer.length == 1) {
                        treeMapLayer = treeMapLayer[0];
                        if (mapLayer.UploadedBy.toLowerCase() == userId.toLowerCase())
                            isPrivateLayer = true;
                        var cn = {
                            "Id": treeMapLayer.id,
                            "Name": treeMapLayer.text,
                            "LayerType": treeLayers.length > 1 ? "GroupLayer" : "IndividualLayer",
                            "FeatureType": customMapId > 0 ? "CustomMap" : isPrivateLayer == true ? "PrivateLayer" : "SharedLayer",
                            "IconUrl": treeMapLayer.icon,
                            "IsChecked": true
                        }
                        listChildNode.push(cn);
                    }
                }

                if (parentLayer != null && parentParentLayer != null && parentParentParentLayer == null) {
                    var pn = {
                        "Id": parentLayer.id,
                        "Name": parentLayer.text,
                        "LayerType": treeLayers.length > 1 ? "GroupLayer" : "IndividualLayer",
                        "FeatureType": customMapId > 0 ? "CustomMap" : isPrivateLayer == true ? "PrivateLayer" : "SharedLayer",
                        "children": listChildNode
                    }
                    listParentNode.push(pn);
                    var ppn = {
                        "Id": parentParentLayer.id,
                        "Name": parentParentLayer.text,
                        "LayerType": treeLayers.length > 1 ? "GroupLayer" : "IndividualLayer",
                        "FeatureType": customMapId > 0 ? "CustomMap" : isPrivateLayer == true ? "PrivateLayer" : "SharedLayer",
                        "children": listParentNode
                    }
                    treeData.push(ppn);
                }
                else if (parentLayer != null && parentParentParentLayer != null && parentParentLayer != null) {
                    var pn = {
                        "Id": parentLayer.id,
                        "Name": parentLayer.text,
                        "LayerType": treeLayers.length > 1 ? "GroupLayer" : "IndividualLayer",
                        "FeatureType": customMapId > 0 ? "CustomMap" : isPrivateLayer == true ? "PrivateLayer" : "SharedLayer",
                        "children": listChildNode
                    }
                    listParentNode.push(pn);
                    var ppn = {
                        "Id": parentParentLayer.id,
                        "Name": parentParentLayer.text,
                        "LayerType": treeLayers.length > 1 ? "GroupLayer" : "IndividualLayer",
                        "FeatureType": customMapId > 0 ? "CustomMap" : isPrivateLayer == true ? "PrivateLayer" : "SharedLayer",
                        "children": listParentNode
                    }
                    listParentParentNode.push(ppn);
                    var pppn = {
                        "Id": parentParentParentLayer.id,
                        "Name": parentParentParentLayer.text,
                        "LayerType": treeLayers.length > 1 ? "GroupLayer" : "IndividualLayer",
                        "FeatureType": customMapId > 0 ? "CustomMap" : isPrivateLayer == true ? "PrivateLayer" : "SharedLayer",
                        "children": listParentParentNode
                    }
                    treeData.push(pppn);
                }
                else if (parentLayer != null && parentParentParentLayer == null && parentParentLayer == null) {
                    var pn = {
                        "Id": parentLayer.id,
                        "Name": parentLayer.text,
                        "LayerType": treeLayers.length > 1 ? "GroupLayer" : "IndividualLayer",
                        "FeatureType": customMapId > 0 ? "CustomMap" : isPrivateLayer == true ? "PrivateLayer" : "SharedLayer",
                        "children": listChildNode
                    }
                    treeData.push(pn);
                }
                else {
                    treeData = listChildNode;
                }
            }
            return treeData;
        },
        ReadDirectory: function (directoryPath) {
            return new Promise((resolve, reject) => {
                if (fs.existsSync(directoryPath)) {
                    //Check Validation 
                    var listOfFileSource = [];
                    fs.readdir(directoryPath, function (error, files) {
                        if (error)
                            return reject(error);
                        else {
                            for (var i = 0; i < files.length; i++) {
                                var fileSource = new AddDataModel.FileSource();
                                fileSource.FileName = files[i].split('.').slice(0, -1).join('.');
                                fileSource.FileExtention = "." + files[i].split('.').slice(1).join('.');
                                fileSource.FilePath = path.join(directoryPath, files[i]);
                                listOfFileSource.push(fileSource);
                            }
                            resolve(listOfFileSource);
                        }
                    });
                }
            });
        },
        KmlsFileValidation: function (listOfFileSource) {
            var feedback = "";
            var filewithKMLextension = [];
            listOfFileSource.map(function (e) {
                if (e.FileExtention.toLowerCase() == ".kml")
                    filewithKMLextension.push(e);
            });

            var filewithKMZextension = [];
            listOfFileSource.map(function (e) {
                if (e.FileExtention.toLowerCase() == ".kmz")
                    filewithKMZextension.push(e);
            });

            if ((filewithKMLextension.length + filewithKMZextension.length) == 0) {
                feedback = "There is no file with .kml or .kmz extension.";
            }
            return feedback;
        },
        MoveKmlFile: function (directoryPath, fileName) {
            return new Promise((resolve, reject) => {
                var oldFilePath = path.join(directoryPath, fileName);
                var lastIndex = directoryPath.lastIndexOf('/');
                var dateDirectoryName = directoryPath.substring(lastIndex + 1);
                var removeTheLastDirectory = directoryPath.substring(0, lastIndex);
                var newDirectoryPath = path.join(removeTheLastDirectory, UserData.UserName);
                newDirectoryPath = path.join(newDirectoryPath, dateDirectoryName);
                var newDirectoryPathWithFile = path.join(newDirectoryPath, fileName);
                if (!fs.existsSync(newDirectoryPath)) {
                    mkdirp(newDirectoryPath, function (error) {
                        if (error)
                            reject(error);
                        else
                            fs.rename(oldFilePath, newDirectoryPathWithFile, function (error, data) {
                                if (error)
                                    reject(error);
                                else {
                                    if (fs.existsSync(directoryPath)) {
                                        fs.rmdirSync(directoryPath);
                                        resolve(newDirectoryPath);
                                    }

                                }

                            });
                    });
                }
            });
        },
        GetKmlData: function (request, response, next) {
            var JsonData = {
                isSuccess: false,
                result: null,
                errorMessage: ''
            }
            var datasetGuid = request.query.dataSetId;
            var fileType = request.query.fileType;
            let Getquery = SQLQueryPrama.GetPrivateLayerByGuid(datasetGuid);
            KnexRaw.raw(Getquery).then(function (privateLayerData) {
                if (privateLayerData.length == 1) {
                    module.exports.GetKmlFilePath(privateLayerData[0], fileType).then(function (data) {
                        if (data && data.FilePath && data.FileType) {
                            if (fs.existsSync(data.FilePath)) {
                                var inputData = {
                                    FilePath: data.FilePath,
                                    FileType: data.FileType,
                                }
                                dotSpatial.ReadKmlFileAndGetCoordinates(inputData, function (error, result) {
                                    if (error) {
                                        JsonData.isSuccess = false;
                                        JsonData.errorMessage = error;
                                        logger.error("GetKmlData", "AddData", error);
                                        response.json(JsonData);
                                    }
                                    if (result) {
                                        JsonData.isSuccess = true;
                                        JsonData.result = result;
                                        response.json(JsonData);
                                    }
                                });
                            }
                        }
                    }, function (error) {
                        JsonData.isSuccess = false;
                        JsonData.errorMessage = error;
                        logger.error("GetKmlData", "AddData", error);
                        response.json(JsonData);
                    })
                }
            }).catch(next);
        },
        ExtractKmzFile: function (filePath) {
            return new Promise((resolve, reject) => {
                fs.rename(filePath, filePath.replace(".kmz", ".zip"), function (error, data) {
                    if (error)
                        reject(error);
                    else {
                        filePath = filePath.replace(".kmz", ".zip");
                        if (fs.existsSync(filePath)) {
                            var lastIndex = filePath.lastIndexOf('/');
                            var directoryPath = filePath.substring(0, lastIndex);
                            directoryPath = path.resolve(directoryPath);
                            extract(filePath, { dir: directoryPath }, function (error) {
                                if (error)
                                    reject(error);
                                else {
                                    fs.rename(filePath, filePath.replace(".zip", ".kmz"), function (error, data) {
                                        if (error)
                                            reject(error);
                                        else {
                                            var kmlFileName = [];
                                            var files = fs.readdirSync(filePath.substring(0, lastIndex));
                                            files.map(function (e) {
                                                if (e.indexOf(".kml") != -1)
                                                    kmlFileName.push(e);
                                            });
                                            if (kmlFileName.length == 1) {
                                                var kmlFilePath = path.join(filePath.substring(0, lastIndex), kmlFileName[0]);
                                                resolve(kmlFilePath);
                                            }
                                        }
                                    });
                                }
                            })
                        }
                    }
                });
            });

        },
        GetKmlFilePath: function (privateLayerData, fileType) {
            return new Promise((resolve, reject) => {
                var filePath = "./UploadedFiles/Kmls/" + privateLayerData.FilePathLocation;
                filePath = UtilityJs.ReplaceAll(filePath, "\\", "/");
                if (fileType.toLowerCase() == ".kmz") {
                    filePath = filePath.replace(".kmz", ".kml");
                    if (!fs.existsSync(filePath)) {
                        filePath = filePath.replace(".kml", ".kmz");
                        //Extract kmz file
                        module.exports.ExtractKmzFile(filePath).then(function (path) {
                            filePath = path;
                            fileType = ".kml";
                            var data = {
                                FilePath: filePath,
                                FileType: fileType
                            }
                            resolve(data);
                        }, function (error) {
                            reject(error);
                        });
                    }
                    else {
                        fileType = ".kml";
                        var kmlFileName = [];
                        var lastIndex = filePath.lastIndexOf('/');
                        var files = fs.readdirSync(filePath.substring(0, lastIndex));
                        files.map(function (e) {
                            if (e.indexOf(".kml") != -1)
                                kmlFileName.push(e);
                        });
                        if (kmlFileName.length == 1) {
                            filePath = path.join(filePath.substring(0, lastIndex), kmlFileName[0]);
                            var data = {
                                FilePath: filePath,
                                FileType: fileType
                            }
                            resolve(data);
                        }
                    }

                }
                else if (fileType.toLowerCase() == ".kml") {
                    fileType = ".kml";
                    var kmlFileName = [];
                    var lastIndex = filePath.lastIndexOf('/');
                    var files = fs.readdirSync(filePath.substring(0, lastIndex));
                    files.map(function (e) {
                        if (e.indexOf(".kml") != -1)
                            kmlFileName.push(e);
                    });
                    if (kmlFileName.length == 1) {
                        filePath = path.join(filePath.substring(0, lastIndex), kmlFileName[0]);
                        var data = {
                            FilePath: filePath,
                            FileType: fileType
                        }
                        resolve(data);
                    }
                }
            });

        },
        CoordinatesFileValidation: function (listOfFileSource) {
            var feedback = "";
            var filewithXLSXextension = [];
            listOfFileSource.map(function (e) {
                if (e.FileExtention.toLowerCase() == ".xlsx")
                    filewithXLSXextension.push(e);
            });

            var filewithXLSextension = [];
            listOfFileSource.map(function (e) {
                if (e.FileExtention.toLowerCase() == ".xls")
                    filewithXLSextension.push(e);
            });

            var filewithCSVextension = [];
            listOfFileSource.map(function (e) {
                if (e.FileExtention.toLowerCase() == ".csv")
                    filewithCSVextension.push(e);
            });

            if ((filewithXLSXextension.length + filewithXLSextension.length + filewithCSVextension.length) == 0) {
                feedback = "There is no file with .xlsx, .xls or .csv extension.";
            }
            else if ((filewithXLSXextension.length + filewithXLSextension.length + filewithCSVextension.length) > 1) {
                feedback = "Please add only one file with .xlsx, .xls or .csv extension.";
            }
            else {
                if (filewithXLSXextension.length == 1) {
                    if (filewithXLSXextension[0].FileName.length > 64)
                        feedback = "Your file name is too long. Rename your file with a maximum of 64 characters and retry the upload. Please contact help@mapsearch.com with any questions.";
                }
                else if (filewithXLSextension.length == 1) {
                    if (filewithXLSextension[0].FileName.length > 64)
                        feedback = "Your file name is too long. Rename your file with a maximum of 64 characters and retry the upload. Please contact help@mapsearch.com with any questions.";
                }
                else if (filewithCSVextension.length == 1) {
                    if (filewithCSVextension[0].FileName.length > 64)
                        feedback = "Your file name is too long. Rename your file with a maximum of 64 characters and retry the upload. Please contact help@mapsearch.com with any questions.";
                }
            }
            return feedback;
        },
        createLogsforUploadfiles(req, UserId, Description) {
            try {
                var UserGuid = UserId;
                var Logtype = CreateLogsHelper.GetLogtype.Upload;
                CreateLogsHelper.createLogs(req, UserGuid, null, null, Logtype, Description).then(function (data) {
                    logger.detaillog("User Login Logs inserted successfully..");
                }, function (error) {
                    logger.error("Login", "Login", "User Login not inserted successfully.." + error);
                });

            } catch (e) {
                console.log(e);
            }
        },
        SetMapLayersProperties(treeLayers, mapLayers, customMapId, userId) {
            try {
                for (var layer of mapLayers) {
                    layer["treestatus"] = treeLayers.length > 1 ? "GroupLayer" : "Individual";
                    layer["FeatureType"] = customMapId > 0 ? "CustomMap" : layer.UploadedBy.toLowerCase() == userId.toLowerCase() ? "PrivateLayer" : "SharedLayer";
                }
            } catch (e) {
                console.log(e);
            }
        }

    };

function ShapeValidation(listOfFileSource) {
    var errorMessage = [];
    var filewithSHPextension = [];
    listOfFileSource.map(function (e) {
        if (e.FileExtention.toLowerCase() == ".shp")
            filewithSHPextension.push(e);
    });
    if (filewithSHPextension.length == 0) {
        errorMessage.push("There is no file with .shp extension.");
    }
    if (filewithSHPextension.length > 1) {
        errorMessage.push("Please add only one file with .shp extension.");
    }

    var filewithSHXextension = [];
    listOfFileSource.map(function (e) {
        if (e.FileExtention.toLowerCase() == ".shx")
            filewithSHXextension.push(e);
    });
    if (filewithSHXextension.length == 0) {
        errorMessage.push("There is no file with .shx extension.");
    }
    if (filewithSHXextension.Count > 1) {
        errorMessage.push("Please add only one file with .shx extension.");
    }

    var filewithDBFextension = [];
    listOfFileSource.map(function (e) {
        if (e.FileExtention.toLowerCase() == ".dbf")
            filewithDBFextension.push(e);
    });
    if (filewithDBFextension.length == 0) {
        errorMessage.push("There is no file with .dbf extension.");
    }
    if (filewithSHXextension.Count > 1) {
        errorMessage.push("Please add only one file with .dbf extension.");
    }

    var filewithPRJextension = [];
    listOfFileSource.map(function (e) {
        if (e.FileExtention.toLowerCase() == ".prj")
            filewithPRJextension.push(e);
    });
    if (filewithPRJextension.length == 0) {
        errorMessage.push("There is no file with .prj extension.");
    }
    if (filewithPRJextension.Count > 1) {
        errorMessage.push("Please add only one file with .prj extension.");
    }

    return errorMessage.toString();
}
function CreateZip(listOfFileSource, out, fileName) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
        for (var i = 0; i < listOfFileSource.length; i++) {
            archive
                .append(fs.createReadStream(listOfFileSource[i].FilePath), { name: fileName + listOfFileSource[i].FileExtention });
        }
        archive.pipe(stream);
        archive.on('error', err => reject(err))
        stream.on('close', res => resolve(res));
        archive.finalize();
    });
}