var logger = require("../Helper/logs");
var SQLQueryPrama = require("../Helper/SqlQuery/LayerQuery");
var UtilityJs = require("../Helper/Utility");
const { Bookmark, KnexRaw } = require('../Models');


const ToolsTestCall = (req, res, next) => {
    logger.detaillog("Tools Controller Call successfully");
    res.json("Tools Call successfully");
}

const GetBookMarks = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        BookMarks: null
    }
    var userId = req.query.UserID;
    Bookmark.find({ UserId: userId, IsDeleted: 0 })
        .then(bookmarks => {
            JsonData.BookMarks = bookmarks;
            JsonData._Issuccess = true;
            res.json(JsonData);
        })
        .catch(next);
}

const SaveBookmark = (req, res, next) => {
    var param = req.body;
    param['BaseMapProviderBaseMapProviderID'] = param.BaseMapProviderID;
    delete param.BaseMapProviderID;
    param['IsDeleted'] = 0;
    param['Created'] = new Date().toISOString();
    Bookmark.save(param)
        .then(data => {
            res.json({ _Issuccess: true });
        })
        .catch(next);
}

const DeleteBookmark = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        BookMarks: null
    }
    var id = req.query.bookmarkID;
    Bookmark.update({ BookmarkID: id }, { IsDeleted: 1 })
        .then(bookmarks => {
            JsonData.BookMarks = bookmarks;
            JsonData._Issuccess = true;
            res.json(JsonData);
        })
        .catch(next);
}

const GetMapsByUserID = (req, res, next) => {
    var JsonData = {
        _Issuccess: false,
        MapbyUSerData: null,
        errormsg: ""
    }
    let Query = SQLQueryPrama.GetMapbyUserQuery(req.query);
    KnexRaw.raw(Query).then(function (ResUserMapData) {
        JsonData._Issuccess = true;
        JsonData.MapbyUSerData = ResUserMapData;
        res.json(JsonData);
    }).catch(next)
}

module.exports = {
    ToolsTestCall,
    GetBookMarks,
    SaveBookmark,
    DeleteBookmark,
    GetMapsByUserID
};