const { InfoboxNotes } = require('../Models');

module.exports =
    {
        SetNotesToInfoRequest: function (req, featureItem) {
            return new Promise((resolve, reject) => {
                try {
                    // let featureItem = responce.body.features[i];
                    let UniqueIds = ['MSID', 'OBJECTID', 'PARCELAPN', 'TAXAPN', 'gid', 'id'];
                    let uniqueLabel = '';
                    let uniqueId = '';
                    for (let i = 0; i < UniqueIds.length; i++) {
                        let uId = UniqueIds[i];
                        if (featureItem.properties[uId]) {
                            uniqueLabel = uId;
                            uniqueId = featureItem.properties[uId];
                            break;
                        }
                    }
                    if (uniqueLabel != '' && uniqueId != '') {
                        let energylayerId = req.body.energyLayerId;
                        let userId = req.body.UserId;
                        InfoboxNotes.find({ EnergyLayerId: energylayerId, EnergyLayerRecordId: uniqueId, UserId: userId, EnergyLayerRecordLabel: uniqueLabel, IsDeleted: 0 })
                            .then(notes => {
                                if (notes && notes.length > 0) {
                                    featureItem['Notes'] = notes;
                                    resolve(featureItem);
                                } else {
                                    resolve(featureItem);
                                }
                            })
                            .catch(err => { reject(err) });
                    } else {
                        resolve(featureItem);
                    }
                } catch (error) {
                    console.log(error);
                    resolve(featureItem);
                }

            });
        },
    }