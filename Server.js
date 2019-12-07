var express = require('express');
var app = express();
var config = require('config');
var port = process.env.port || config.server.port;
var httpsPort = config.server.httpsPort;
var bodyParser = require('body-parser');
var path = require('path');
var auth = require('./Helper/Authentication');
var unless = require('express-unless');
var logger = require("./Helper/logs");
auth.CheckToken.unless = unless;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";//SSL certificate issue for localhost
require('events').EventEmitter.defaultMaxListeners = 1500000;
var fs = require('fs');
var http = require('http');
var https = require('https');

var privateKey = fs.readFileSync('sslcert/key.pem', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate };

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

var geoServerNewController = require('./Controller/GeoServerNewController');

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(express.static(__dirname + '/Img'));
app.use(bodyParser.json({ limit: config.server.bodyParser.limit }));
app.use(bodyParser.urlencoded({ limit: config.server.bodyParser.limit, extended: config.server.bodyParser.isExtended }));

//*****************************Cross Origin Issue ************/
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});
//*************************End Cross Origin Issue ************/

//***********************Server Indec File ********************/
app.get('/', function (req, res) {
    res.sendFile(path.resolve('index.html'));
});
//***********************End Server Indec File *****************/

//******************** Controller Files  *************************************/
var productController = require('./Routes/ProductsRoutes');
var LayersControlleer = require('./Routes/MapSearchLayerRoutes');
var GeoServerController = require('./Routes/GeoServerRoutes');
var GeoServerNewController = require('./Routes/GeoServerNewRoutes');
var IconcreateController = require('./Routes/IconCreateRoutes');
var LoginController = require('./Routes/LoginRoutes');
var AddDataController = require('./Routes/AddDataRoutes');
var LayerstyleController = require('./Routes/LayerStyleRoutes');
var CreateLayerController = require('./Routes/CreateLayerRoute');
var ToolsController = require('./Routes/ToolRoutes');
var GlobalController = require('./Routes/GlobalSearchRoutes');
var HomeDashboardController = require('./Routes/HomeDashboardRoutes');
var FeedbackController = require('./Routes/FeedbackRoutes');
var SiteSelectionController = require('./Routes/SiteSelectionRoute');
var MyMapController = require('./Routes/MyMapRoutes');
var InfoboxNotesController = require('./Routes/InfoboxNotesRoutes');
var ParcelDataController = require('./Routes/ParcelsDataRoutes');
var SharedDataController = require('./Routes/SharedDataRoutes');
var DrawToolsController = require('./Routes/DrawToolsRoutes');

/****** Intelligence ControllerList */
var CompanyProfileController = require('./Routes/Intelligence/CompanyIntelligenceRoutes');
var PipelineActivityController = require('./Routes/Intelligence/PipelineActivityRoutes');
var TransmissionProjectController = require('./Routes/Intelligence/TransmissionProjectRoutes');
var PowerPlantsController = require('./Routes/Intelligence/PowerPlantsRoutes');
var GeneratingUnitsController = require('./Routes/Intelligence/GeneratingUnitsRoutes');
/******  End Intelligence ControllerList */

app.use('*', (req, res, next) => {
    if (req.method == "OPTIONS") {
        res.status(200);
        res.send();
    } else {
        next();
    }
});


app.use(config.server.apiUrl, [
    GeoServerController,
    GeoServerNewController,
    LoginController,
    PipelineActivityController,
    CompanyProfileController,
    TransmissionProjectController,
    PowerPlantsController,
    GeneratingUnitsController,
    IconcreateController
]);

if (config.IsTokanGenrate.Tokan === true) {
    logger.detaillog("All API call is Tokan based.");
    app.use(config.server.apiUrl, auth.CheckToken, [
        LayersControlleer,
        productController,
        AddDataController,
        CreateLayerController,
        LayerstyleController,
        ToolsController,
        GlobalController,
        HomeDashboardController,
        SiteSelectionController,
        FeedbackController,
        MyMapController,
        InfoboxNotesController,
        ParcelDataController,
        SharedDataController,
        DrawToolsController
    ]);
    //// not check Tokan for unless 
    //app.use(config.server.apiGeoServer, auth.CheckToken.unless({ path: [config.server.apiGeoServer + '/GetGeomap', config.server.apiGeoServer] }), GeoServerController);

} else {
    logger.detaillog("All API call is Not Tokan based.");
    app.use(config.server.apiUrl, [
        LayersControlleer,
        productController,
        AddDataController,
        CreateLayerController,
        LayerstyleController,
        ToolsController,
        GlobalController,
        HomeDashboardController,
        SiteSelectionController,
        FeedbackController,
        MyMapController,
        InfoboxNotesController,
        ParcelDataController,
        SharedDataController,
        DrawToolsController
    ]);
}
//******************** End Controller Files  ***********************************/

//----------------------- Error Middleware ----------------------------------//
app.use(require('./Middlewares/error').all)

httpServer.listen(port, function () {
    var datetime = new Date();
    var message = "Server runnning on Port no is:- " + port + " Started at :- " + datetime;
    var message1 = "Browser URL := http://localhost:" + port + "/api";
    console.log(message);
    console.log(message1);
    // geoServerNewController.BlankTempMapImageTable();
});

httpsServer.listen(httpsPort, function () {
    var datetime = new Date();
    var message = "Server runnning on Port no is:- " + httpsPort + " Started at :- " + datetime;
    var message1 = "Browser URL := https://localhost:" + httpsPort + "/api";
    console.log(message);
    console.log(message1);
});

// app.listen(port, function () {
//     var datetime = new Date();
//     var message = "Server runnning on Port no is:- " + port + " Started at :- " + datetime;
//     var message1 = "Browser URL := http://localhost:" + port + "/api";
//     console.log(message);
//     console.log(message1);
// });
