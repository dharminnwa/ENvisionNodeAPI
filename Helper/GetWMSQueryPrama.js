var config = require('config');
var wmsUrl = config.GEOServerUrl.wmsUrl;
var wfsUrl = config.GEOServerUrl.wfsUrl;
var testWMSUrl = config.GEOServerUrl.testWMSServer.wmsUrl;
module.exports =
    {
        CreateWMSBaseMaptileURL: function (querystring) {
            var WMSParameter = wmsUrl;
            let CQL_FILTER = querystring.CQL_FILTER;
            WMSParameter += "Layers=BaseMaps%3A" + querystring.layer + "&version=1.3.0&EXCEPTIONS=INIMAGE&Service=WMS&request=GetMap&format=image%2Fpng&CRS=EPSG:4326&BBOX=" + querystring.bbox + "&width=256&height=256&isBaseLayer=True&TRANSPARENT=true";
            if (CQL_FILTER)
                WMSParameter += "&CQL_FILTER=" + CQL_FILTER;
            return WMSParameter;
        },
        CreateWMStileURL: function (querystring) {
            var WMSParameter = wmsUrl;
            let SLD_BODY = encodeURIComponent(querystring.Body);
            let BBOX = querystring.bbox;
            let CQL_FILTER = querystring.CQL_FILTER;
            let version = "1.3.0";
            let TILED = "false";
            let EXCEPTIONS = "INIMAGE";
            let Service = "WMS";
            let request = "GetMap";
            let format = "image%2Fpng";
            let CRS = "EPSG:4326";
            let width = "256";
            let height = "256";
            let isBaseLayer = "true";
            let TRANSPARENT = "true";
            WMSParameter += "SLD_BODY=" + SLD_BODY + "&version=" + version
                + "&EXCEPTIONS=" + EXCEPTIONS
                + "&Service=" + Service + "&request=" + request
                + "&format=" + format + "&CRS=" + CRS + "&BBOX=" + BBOX
                + "&width=" + width + "&height=" + height
                + "&isBaseLayer=" + isBaseLayer + "&TRANSPARENT=" + TRANSPARENT;
            if (CQL_FILTER)
                WMSParameter += "&CQL_FILTER=" + encodeURIComponent(CQL_FILTER);
            return WMSParameter;
        },
        CreateWFSURL: function (Param) {
            let URLParameter = "service=WFS&version=1.0.0&request=GetFeature";
            URLParameter += "&typeName=BaseMaps:" + Param.energyLayer.TableName;
            //URLParameter += "&propertyName=" + energyLayer.DBFProperties;
            if (Param.energyLayer.DBFProperties.indexOf('=') > 0) {
                URLParameter += "&propertyName=" + Param.energyLayer.DetailPanelPropertiesMain;
            }
            else {
                URLParameter += "&propertyName=" + Param.energyLayer.DBFProperties;
            }
            URLParameter += "&outputFormat=application/json";
            URLParameter += "&startIndex=" + Param.startIndex;
            URLParameter += "&maxFeatures=" + Param.maxFeatures;
            //URLParameter += "&sortBy=gid";
            // if (bbox && !CQL_FILTER) {
            //     URLParameter += "&bbox=" + bbox;
            // }
            // else if (bbox && CQL_FILTER) {
            //     URLParameter += '&BBOX(the_geom,' + bbox + ')';
            // }
            if (Param.CQL_FILTER) {
                URLParameter += Param.CQL_FILTER;
            }
            if (Param.sortBy && Param.energyLayer.DetailPanelPropertiesMain.indexOf('gid') >= 0) {
                URLParameter += "&sortBy=" + Param.sortBy;
            }
            else if (Param.energyLayer.DetailPanelPropertiesMain.indexOf('gid') >= 0) {
                URLParameter += "&sortBy=gid";
            }
            else {
                let split = Param.energyLayer.DetailPanelPropertiesMain.split(',');
                for (let splitval = 0; splitval < split.length; splitval++) {
                    let prop = split[splitval];
                    if (prop == 'the_geom') {
                        continue;
                    }
                    else if (prop == "gid" || prop.toLowerCase() == "api" || prop.toLowerCase() == "County") {
                        URLParameter += "&sortBy=" + prop;
                        break;
                    }
                    else {
                        URLParameter += "&sortBy=" + prop;
                        break;
                    }

                }
            }

            return wfsUrl + URLParameter;
        },
        CreateWFSBody: function (Param) {
            let body = {};
            body['service'] = "WFS";
            body['version'] = "1.0.0";
            body['request'] = "GetFeature";
            body['typeName'] = "BaseMaps:" + Param.energyLayer.TableName;
            if (Param.energyLayer.DBFProperties.indexOf('=') > 0)
                body['propertyName'] = Param.energyLayer.DetailPanelPropertiesMain;
            else
                body['propertyName'] = Param.energyLayer.DBFProperties;
            body['outputFormat'] = "application/json";
            body['startIndex'] = Param.startIndex;
            body['maxFeatures'] = Param.maxFeatures;
            if (Param.CQL_FILTER) {
                Param.CQL_FILTER = Param.CQL_FILTER.replace('&CQL_FILTER=', '');
                body['CQL_FILTER'] = decodeURIComponent(Param.CQL_FILTER);
            }
            if (Param.sortBy && Param.energyLayer.DetailPanelPropertiesMain.indexOf('gid') >= 0) {
                body['sortBy'] = Param.sortBy;
            }
            else if (Param.energyLayer.DetailPanelPropertiesMain.indexOf('gid') >= 0) {
                body['sortBy'] = "gid";
            }
            else {
                let split = Param.energyLayer.DetailPanelPropertiesMain.split(',');
                for (let splitval = 0; splitval < split.length; splitval++) {
                    let prop = split[splitval];
                    if (prop == 'the_geom') {
                        continue;
                    }
                    else if (prop == "gid" || prop.toLowerCase() == "api" || prop.toLowerCase() == "County") {
                        body['sortBy'] = prop;
                        break;
                    }
                    else {
                        body['sortBy'] = prop;
                        break;
                    }

                }
            }
            return body;
        },
        WFSExportURL: function (Param) {
            let URLParameter = "service=WFS&version=1.0.0&request=GetFeature";
            URLParameter += "&typeName=BaseMaps:" + Param.energyLayer.TableName;
            URLParameter += "&propertyName=" + Param.propertyName;
            URLParameter += "&outputFormat=application/json";
            if (Param.CQL_FILTER) {
                URLParameter += Param.CQL_FILTER;
            }
            return wfsUrl + URLParameter;
        },
        WFSGetLayerDatabasedonProp: function (Param) {
            let URLParameter = "service=WFS&version=1.0.0&request=GetFeature";
            URLParameter += "&typeName=BaseMaps:" + Param.energyLayer.TableName;
            //URLParameter += "&propertyName=" + energyLayer.DBFProperties;
            // if (energyLayer.DBFProperties.indexOf('=') > 0) {
            // URLParameter += "&propertyName=" + energyLayer.DetailPanelPropertiesMain;
            //}
            // else {
            URLParameter += "&propertyName=" + Param.propertyName;        //}
            URLParameter += "&outputFormat=application/json";
            URLParameter += "&startIndex=" + Param.startIndex;
            URLParameter += "&maxFeatures=" + Param.maxFeatures;
            //URLParameter += "&sortBy=gid";
            // if (bbox && !CQL_FILTER) {
            //     URLParameter += "&bbox=" + bbox;
            // }
            // else if (bbox && CQL_FILTER) {
            //     URLParameter += '&BBOX(the_geom,' + bbox + ')';
            // }
            if (Param.CQL_FILTER) {
                URLParameter += Param.CQL_FILTER;
            }
            if (Param.sortBy && Param.energyLayer.DetailPanelPropertiesMain.indexOf('gid') >= 0) {
                URLParameter += "&sortBy=" + Param.sortBy;
            } else if (Param.sortBy && Param.energyLayer.DetailPanelPropertiesMain.indexOf('gid') == -1) {
                URLParameter += "&sortBy=" + Param.sortBy;
            }
            else if (Param.energyLayer.DetailPanelPropertiesMain.indexOf('gid') >= 0) {
                URLParameter += "&sortBy=gid";
            }
            else {
                let split = Param.energyLayer.DetailPanelPropertiesMain.split(',');
                for (let splitval = 0; splitval < split.length; splitval++) {
                    let prop = split[splitval];
                    if (prop == 'the_geom') {
                        continue;
                    }
                    else if (prop == "gid" || prop.toLowerCase() == "api" || prop.toLowerCase() == "County") {
                        URLParameter += "&sortBy=" + prop;
                        break;
                    }
                    else {
                        URLParameter += "&sortBy=" + prop;
                        break;
                    }

                }

            }
            return wfsUrl + URLParameter;
        },
        WFSGetFeaturetype: function (Param) {
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(Param.energyLayer.TableName)) {
                let URLParameter = "service=WFS&version=1.0.0&request=DescribeFeatureType";
                URLParameter += "&typeName=BaseMaps:" + Param.energyLayer.TableName.toLowerCase();
                URLParameter += "&outputFormat=application/json";
                return wfsUrl + URLParameter;
            }
            else {
                let URLParameter = "service=WFS&version=1.0.0&request=DescribeFeatureType";
                URLParameter += "&typeName=BaseMaps:" + Param.energyLayer.TableName;
                URLParameter += "&outputFormat=application/json";
                return wfsUrl + URLParameter;
            }
        },
        WFSPrivateLayerData: function (Param) {
            let URLParameter = "service=WFS&version=1.0.0&request=GetFeature";
            URLParameter += "&typeName=BaseMaps:" + Param.privateLayer.TableName;
            //URLParameter += "&propertyName=" + energyLayer.DBFProperties;
            if (Param.privateLayer.DBFProperties != null && Param.privateLayer.DBFProperties.indexOf('=') > 0) {
                URLParameter += "&propertyName=" + Param.privateLayer.DetailPanelPropertiesMain;
            }
            URLParameter += "&outputFormat=application/json";
            URLParameter += "&startIndex=" + Param.startIndex;
            URLParameter += "&maxFeatures=" + Param.maxFeatures;
            //URLParameter += "&sortBy=gid";
            // if (bbox && !CQL_FILTER) {
            //     URLParameter += "&bbox=" + bbox;
            // }
            // else if (bbox && CQL_FILTER) {
            //     URLParameter += '&BBOX(the_geom,' + bbox + ')';
            // }
            if (Param.sortBy && Param.privateLayer.DetailPanelPropertiesMain != null && Param.privateLayer.DetailPanelPropertiesMain.indexOf('gid') >= 0) {
                URLParameter += "&sortBy=" + Param.sortBy;
            }
            else if (Param.privateLayer.DetailPanelPropertiesMain != null && Param.privateLayer.DetailPanelPropertiesMain.indexOf('gid') >= 0) {
                URLParameter += "&sortBy=gid";
            } else {
                if (Param.privateLayer.DetailPanelPropertiesMain) {
                    let split = Param.privateLayer.DetailPanelPropertiesMain.split(',');
                    for (let splitval = 0; splitval < split.length; splitval++) {
                        let prop = split[splitval];
                        if (prop == 'the_geom') {
                            continue;
                        }
                        else if (prop == "gid" || prop.toLowerCase() == "api" || prop.toLowerCase() == "County") {
                            URLParameter += "&sortBy=" + prop;
                            break;
                        }
                        else {
                            URLParameter += "&sortBy=" + prop;
                            break;
                        }

                    }
                }
            }
            return wfsUrl + URLParameter;
        },
        WFSGetInfoboxURL: function (Param) {
            let typeName = "BaseMaps%3A" + Param.TableName;
            let URLParameter = "&service=WFS&version=1.0.0&request=GetFeature&typeName=" + typeName + "&outputFormat=application/json";
            if (Param.CQL_FILTER) {
                URLParameter += Param.CQL_FILTER;
            }
            if (Param.Bbox && !Param.CQL_FILTER) {
                URLParameter += "&bbox=" + Param.Bbox;
            }
            return wfsUrl + URLParameter;
        },
        GetTableColumns: function (TableName) {
            let Query = "SELECT  COLUMN_NAME    FROM   information_schema.COLUMNS    WHERE  TABLE_NAME = '" + TableName + "';"
            return Query;
        },
        GetDistinctData: function (TableName, COLUMNSName) {
            //let Query = " select distinct " + COLUMNSName + " from " + TableName;
            let query = "select string_agg(distinct " + COLUMNSName + ", '@') as " + COLUMNSName + " from " + TableName;
            return query;
        }
    };