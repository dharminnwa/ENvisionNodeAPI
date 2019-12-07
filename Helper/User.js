var SQLQueryPrama = require("./SqlQuery/UserQuery");
const { KnexRaw } = require('../Models');
module.exports =
    {
        GetAllRoles: function (request, response, next) {
            var JsonData = {
                _Issuccess: false,
                result: null,
                errormsg: ''
            }
            var userID = request.query.UserID;
            var promises = [];
            promises.push(module.exports.GetCustomerRole(userID));
            promises.push(module.exports.GetLayerCategoriesRole(userID));
            Promise.all(promises).then(function (data) {
                if (data.length == 2) {
                    let customerRole = [];
                    let layerCategoryRole = [];
                    if (data[0].length == 1)
                        customerRole = data[0][0].Roles.split(',');
                    if (data[1].length > 0)
                        layerCategoryRole = data[1].map(x => x.CategoryName);
                    JsonData._Issuccess = true;
                    JsonData.result = {
                        CustomerRoles: customerRole,
                        LayerCategoriesRoles: layerCategoryRole
                    }
                    response.json(JsonData);
                }
            }, function (error) {
                JsonData.errormsg = error;
                response.json(JsonData);
            });
        },
        GetCustomerRole: function (userId) {
            return new Promise((resolve, reject) => {
                var queryOfCustomerRole = SQLQueryPrama.GetCustomerRolesQuery(userId);
                return KnexRaw.raw(queryOfCustomerRole).then(data => { resolve(data) }).catch(error => { reject(error) });
            });
        },
        GetLayerCategoriesRole: function (userId) {
            return new Promise((resolve, reject) => {
                var queryOfLayerCategoriesRole = SQLQueryPrama.GetLayerCategoriesRolesQuery(userId);
                return KnexRaw.raw(queryOfLayerCategoriesRole).then(data => { resolve(data) }).catch(error => { reject(error) });
            });
        }
    }