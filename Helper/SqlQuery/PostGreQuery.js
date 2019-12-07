module.exports = {
    GetParcelStatesQuery: function (data) {
        let query = "SELECT fips, state_name from public.us_counties WHERE ST_DWithin(geom, ST_GeometryFromText('POINT(" + data.lng + " " + data.lat + ")')," + data.distanceMeter / 100000 + ")";
        return query;
    },
    GetParcelStatesLineStringQuery: function (data) {
        let query = ''
        if (data.points && data.points.length > 0) {
            query = "SELECT fips, state_name from public.us_counties WHERE ST_DWithin(geom, ST_GeometryFromText('LINESTRING("
            for (let i = 0; i < data.points.length; i++) {
                let latLng = data.points[i];
                query += latLng.lng + " " + latLng.lat
                if (data.points.length - 1 != i) {
                    query += ', '
                }
            }
            query += ")')," + data.distanceMeter / 100000 + ")";
        }
        return query;
    },
    GetParcelTreeNameQuery: function (data) {
        let query = '';
        if (data.fips)
            query = "select * from EnergyLayers where TableName = 'ParcelPoints_" + data.fips + "' or TableName = 'Parcels_" + data.fips + "'";
        return query;
    },
    GetDistinctPropertyValues(tableName) {
        let query = "select distinct \"USECDSTDSC\" from  \"" + tableName + "\" where \"USECDSTDSC\" is not null order by  \"USECDSTDSC\"";
        return query;
    }
}

