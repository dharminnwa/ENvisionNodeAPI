module.exports = {
    GetCustomerRolesQuery: function (userId) {
        let query = "select c.Roles from [MapSearchAttributes].[dbo].[CustomerUsers] cu, [MapSearchAttributes].[dbo].[Customer] c where UserGuid = '" + userId + "' and cu.CustomerID = c.CustomerID"
        return query;
    },
    GetLayerCategoriesRolesQuery: function (userId) {
        let query = "select c.CategoryName from [MapSearchAttributes].[dbo].[CustomerUsers] cu, [MapSearchAttributes].[dbo].[CategoriesByCustomer] cc, Category c  where cc.CustomerId = cu.CustomerId and c.CategoryId=cc.CategoryId and cu.UserGuid = '" + userId + "'";
        return query;
    },
    GetLayerCategoriesRolesIdsQuery: function (userId) {
        let query = "select c.CategoryId from [MapSearchAttributes].[dbo].[CustomerUsers] cu, [MapSearchAttributes].[dbo].[CategoriesByCustomer] cc, Category c  where cc.CustomerId = cu.CustomerId and c.CategoryId=cc.CategoryId and cu.UserGuid = '" + userId + "'";
        return query;
    }
}