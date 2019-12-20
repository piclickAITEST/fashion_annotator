function drawBox_old() {

    var main_canvas = document.getElementById('canvas');
    var main_ctx = main_canvas.getContext("2d");
    var img = new Image();

    var img_w = img_size[0];
    var img_h = img_size[1];


    if (img_w > img_h){
        if (img_w > 750) {
            resize_ratio = 750 / img_w
            img_h = resize_ratio * img_h
            img_w = 750;
        }
    }
    else{
        if (img_size[1] > 750){
            resize_ratio = 750 / img_h
            img_w = resize_ratio * img_w
            img_h = 750;
        }
    }

    if (img_path in saveDict) {
	    delindexlist = saveDict[img_path];
    }

    img.onload = function () {
        main_ctx.drawImage(img, 0, 0, img_w, img_h);

        labelDOM = "<div class='label_container btn-group-toggle' data-toggle='buttons'>";

        for (i = 0; i < objList.length; i++) {
            if (delindexlist.indexOf(i) >= 0) {
		labelDOM += '' + "<p><input type='button' onclick='adddelindex(" + i + ")' onmouseover='hightlight(" + i + ");' onmouseout='drawBox();' class='btn btn-primary' style='margin-left: 20px; background-color: white; color: " + colorlist[i] + "; border-color: " + colorlist[i] + ";' " +
                "value='" + i + " " + objList[i][1] + "' id='label_container_" + i + "' ></p>";

                continue
            }
            var canvas = document.getElementById('canvas');
            var ctx = canvas.getContext('2d');

            var x1 = objList[i][0][0] * resize_ratio;
            var y1 = objList[i][0][1] * resize_ratio;
            var w = (objList[i][0][2] - objList[i][0][0]) * resize_ratio;
            var h = (objList[i][0][3] - objList[i][0][1]) * resize_ratio;

            ctx.beginPath();
            ctx.lineWidth = '4';
            ctx.fillStyle = colorlist[i];
            ctx.globalAlpha = "1.0";
            ctx.rect(x1, y1, w, h); // x,y,w,h
            ctx.font = "20px Comic Sans MS";
            ctx.fillStyle = colorlist[i];
            ctx.fillText(i, x1 + 5, y1 + 20);
            ctx.strokeStyle = colorlist[i];
            ctx.stroke();

            labelDOM += '' + "<p><input type='button' onclick='adddelindex(" + i + ")' onmouseover='hightlight(" + i + ");' onmouseout='drawBox();' class='btn btn-primary' style='margin-left: 20px; background-color: " + colorlist[i] + "; border-color: " + colorlist[i] + ";' " +
                "value='" + i + " " + objList[i][1] + "' id='label_container_" + i + "' ></p>";
        }
        labelDOM += "</div>";

        var $labelContainer = $(".label_container");
        $labelContainer.replaceWith(labelDOM);
    };
    img.src = img_path;
}

function hightlight_old(i){
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    var x1 = objList[i][0][0] * resize_ratio;
    var y1 = objList[i][0][1] * resize_ratio;
    var w = (objList[i][0][2] - objList[i][0][0]) * resize_ratio;
    var h = (objList[i][0][3] - objList[i][0][1]) * resize_ratio;

    ctx.beginPath();
    ctx.lineWidth = '6';
    ctx.fillStyle = colorlist[i];
    ctx.globalAlpha="0.4";
    ctx.fillRect(x1, y1, w, h); // x,y,w,h
    ctx.strokeStyle = colorlist[i];
    ctx.stroke();
    ctx.globalAlpha="1.0";
    ctx.font = "30px Comic Sans MS";
    ctx.fillStyle  = "rgb(255, 255, 255)";
    ctx.fillText(objList[i][1], x1 + 5, y1 + 50);


}