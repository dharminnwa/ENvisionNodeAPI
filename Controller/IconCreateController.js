var ReadDllforImage = require("../Helper/GetIconFromDLL");
var logger = require("../Helper/logs");

const GetIconTest = (req, res, next) => {
    logger.detaillog("Icon Controller Call successfully");
    res.json("Icon Call successfully");
}

const GetIcon = (req, res, next) => {
    //https://api.envisionmaps.com:8080/api/icongenerate/get/?Id=11116&URLType=CustomStyleIcon&FillColor=00F8F0F0&IconType=RoundedRectangle&StrokeColor=FFFF0000&SizePercent=10&StrokeThicknessPercent=5&Opacity=1    
    var data = null;
    let icondata = req.query;
    if (req.originalUrl.indexOf('amp;') > 0) {
        data = {
            Id: icondata.Id,
            URLType: icondata["amp;URLType"],
            FillColor: icondata["amp;FillColor"],
            IconType: icondata["amp;IconType"],
            StrokeColor: icondata["amp;StrokeColor"],
            SizePercent: icondata["amp;SizePercent"],
            StrokeThicknessPercent: icondata["amp;StrokeThicknessPercent"],
            Opacity: icondata["amp;Opacity"]
        }
    } else {
        data = {
            Id: icondata.Id,
            URLType: icondata.URLType,
            FillColor: icondata.FillColor,
            IconType: icondata.IconType,
            StrokeColor: icondata.StrokeColor,
            SizePercent: icondata.SizePercent,
            StrokeThicknessPercent: icondata.StrokeThicknessPercent,
            Opacity: icondata.Opacity
        }
    }
    setTimeout(() => {
        console.log(data);
        ReadDllforImage.GetImageIcon(data, function (error, result) {
            if (error || !result) {
                logger.error("Icon", "GetIcon", error);
                var defualimag = "iVBORw0KGgoAAAANSUhEUgAAAA8AAAAREAIAAADd+L21AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0T///////8JWPfcAAAAB3RJTUUH4wUbCiQs3VuU8QAAA8tJREFUOMud039Qk3UcwPHJxCmtM8hj0QjzNAmd1bV2EYolXUf5q7vI7NdIO+JOuEyxuiuEdRORsDNF7lhZHXo0MJpkyhZQVO5w/PDEAW2DTWSbwMD9YM/mmM/zfJ9vz+dh6yQtrz6ve/763vN+7vs8z5eHZ4bixAF0CWDEOcGYmIuU4cz3Zzqml+XE5Mzx75OEJO7JSyvzViq9sYoShYKst9vsl/HXTDpriJMKePjf5xzOxBk3vqhbXJc6RaY1p1VPKuer52scS/mZ/I1DCfN+n+cat5S/Vq6lW/yt/p6bb71TmmYhKtuUbVL5enM+efkB5xvC1rvnmGPiDsVV951KeSHFP7yruGkvQ4a9Md6nb5f2czo5bs7MbKW+o1pCJxvWNHQQsY/qHmt3vChIFnT25KbVrMiy7juwvEIS0FjP2nKZBrqabsQ/ckgQTdcD5kuAczgk++5JSmvfYT/pH9ghLxC4xxNdohrT4wt33rOxT1uQWLgqOOk87ByJFAoBswtgNYimKwEKIw+rMrQ29Dx1fvjZ4Q8C6aqFKpUXSZ+STo+/de/xRfye31JGH1zqeKU2dCKW3hM6EvolUogHqBfgN0E0PQYYSdAY7ArL9A/pHybISs1Bvveu9UXrB9xY9K3IMVwZvyj+2MVDGb41pPeo4Z3OfKzFW3FupHCDI+KMglmfkVLbTtlqfft363erfW2bD2/OI6SyQdnBax6xX2w1yURzRT6zcsOTm8LBJef3GMz4XVpJf/NPf8CsNFllfc4qnUyU58oXu5LEXeISjy7ZmFw1rknKSVptLo03J6QPfZpemPHxlLROpF6B2oliInCndDOgrwReCmQT9ZpGzUdXf1gbk6kfSRCqhQdsXwksgpE/tggVQoMRSSoe+Wws7/MFR1qoc+7l7sFIIZbTxIFflo6m5QDtRaWolD5NTBGuiXxtv7bAWJ5fm//hALXuaFZSv3FdVdZ+o0zu27Z9QtP8um4Vkl6vue6ZCTB9AIkBPgt4f506FvMeQCQr6Cix3z/S2p3ehn4WXCM7+7qK/K92K7vtU+H+9oEKcq5vu68DlzFVzLFIQQfQKGCqAe9vx5oVLmY9Y75gabPUmk5bsiyDqAkRzH24l2PgBDi3DvcA/D64zUEnJESm38WmnZaxSb071bMADjt7/ceZnWYA8QShI/qcb19tGuVRq6l2agL/r4mmOwCzCYRU05LpnURvYDy4jd2cnlUGGCvACs6t8xNgPAB7QTRdBGgt/St9gVpCbaHK0HE0hEKR1csANXKaAVZxbt7wFRBZ5YM/AS4drgkmZ3GHAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTA1LTI3VDEwOjM2OjQ0KzAwOjAwuqsl3gAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wNS0yN1QxMDozNjo0NCswMDowMMv2nWIAAAAASUVORK5CYII=";
                // result = new Buffer(defualimag);
                result = defualimag;
            }
            var img = new Buffer(result, 'base64');
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': img.length
            });
            res.end(img);
        });
    }, 500);

   
}

module.exports = {
    GetIconTest,
    GetIcon
};