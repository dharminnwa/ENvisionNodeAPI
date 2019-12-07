const { KnexRaw, Log } = require('../Models');


module.exports =
    {
        test: function () {
            return "Test"
        },
        GetLogtype: Object.freeze({ Authentication: "Authentication", BaseMapChanged: "BaseMapChanged", CompanyPermissions: "CompanyPermissions", DataGridSearch: "DataGridSearch", ExcelExport: "ExcelExport", Exception: "Exception", ExpressAuthentication: "ExpressAuthentication", ExpressBaseMapChanged: "ExpressBaseMapChanged", ExpressDataGridSearch: "ExpressDataGridSearch", Feedback: "Feedback", IsolatedStorage: "IsolatedStorage", KMLExport: "KMLExport", PasswordChange: "PasswordChange", ServerVariables: "ServerVariables", System: "System", Upload: "Upload", UserPermissions: "UserPermissions", WidgetsChanged: "WidgetsChanged", MapsearchLayerAdded: "MapsearchLayerAdded", LoadedMap: "LoadedMap", ParcelBuffer: "ParcelBuffer", SiteSelection: "SiteSelection", MyMapChanged: "MyMapChanged" }),
        GetLogsPropobj: Object.freeze({ "UserGuid": "", "EnergyLayerGuid": "", "DatasetGuid": "", "Timestamp": new Date(), "LogType": "", "Description": "", "Host": "", "HostIP": "" }),
        createLogs: function (req, UserGuid, EnergyLayerGuid, DatasetGuid, LogType, Description) {
            var Hostname = this.GetHostName(req);
            var hostIP = this.GetHostIPAddress(req);
            var Logs = {
                UserGuid: UserGuid,
                EnergyLayerGuid: EnergyLayerGuid,
                DatasetGuid: DatasetGuid,
                Timestamp: new Date(),
                LogType: LogType,
                Description: Description,
                Host: Hostname,
                HostIP: hostIP
            }
            if (Logs.Host.toString().toLowerCase().indexOf("localhost") >= 0) {
                Logs.Description = "DEBUG: " + Description;
            }
            Logs.Host = "html.envisionmaps.com";

            return new Promise((resolve, reject) => {
                Log.save(Logs)
                    .then(data => {
                        resolve(data);
                    }).catch(err => {
                        reject(err)
                    });
            });
        },
        GetHostIPAddress: function (req) {
            return (req.headers['x-forwarded-for'] || '').split(',').pop() ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;
        }, GetHostName: function (req) {
            return req.headers.host
        }
    }