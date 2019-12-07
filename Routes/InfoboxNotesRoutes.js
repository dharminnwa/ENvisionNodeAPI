'use strict'

const router = require('express').Router()
const {
    NotesTestCall,
    SaveNotes,
    UpdateNotes,
    DeleteNotes,
    GetNotesforSelectedLayer
} = require('../Controller/InfoboxNotesController');
const config = require('config');

var apiNotesUrl = config.server.apiNotes;

router.route(apiNotesUrl + '/')
    .get(NotesTestCall);

router.route(apiNotesUrl + '/SaveNotes')
    .post(SaveNotes);

router.route(apiNotesUrl + '/UpdateNotes')
    .post(UpdateNotes);

router.route(apiNotesUrl + '/DeleteNotes')
    .post(DeleteNotes);

router.route(apiNotesUrl + '/GetNotesForEnergyLayer')
    .get(GetNotesforSelectedLayer);

module.exports = router
