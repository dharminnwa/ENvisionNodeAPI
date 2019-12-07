var logger = require("../Helper/logs");
const { InfoboxNotes } = require('../Models');


const NotesTestCall = (req, res, next) => {
    logger.detaillog("Infobox Notes Controller Call successfully");
    res.json("Infobox Notes Call successfully");
}

const SaveNotes = (req, res, next) => {
    var item = req.body;
    item['Created'] = new Date().toISOString(); 
    item['IsPublic'] = 0;
    item['IsDeleted'] = 0;
    InfoboxNotes.save(item)
    .then(data => {
        res.json({ data: data, _Issuccess: true });
    })
    .catch(next);
}

const UpdateNotes = (req, res, next) => {
    var item = req.body;
    InfoboxNotes.update({ Id: item.Id }, { NoteValue: item.NoteValue })
    .then(data => {
        res.json({ data: data, _Issuccess: true });
    })
    .catch(next);
}

const DeleteNotes = (req, res, next) => {
    var id = req.body.id;
    InfoboxNotes.update({ Id: id }, { IsDeleted: 1 })
    .then(data => {
        res.json({ _Issuccess: true });
    })
    .catch(next);
}

const GetNotesforSelectedLayer = (req, res, next) => {
    var energylayerId = req.query.energylayerId;
    var userId = req.query.userId;
    InfoboxNotes.find({ EnergyLayerId: energylayerId, UserId: userId, IsDeleted: 0 })
    .then(data => {
        res.json({ _Issuccess: true, data: data });
    })
    .catch(next);
}

module.exports = {
    NotesTestCall,
    SaveNotes,
    UpdateNotes,
    DeleteNotes,
    GetNotesforSelectedLayer
};