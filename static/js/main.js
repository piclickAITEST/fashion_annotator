var index = 0;
var startindex = 0;
var rR = 1;
var modifystatus = false;
var listofjson = new Object();

var img_path = '';
var img_size = '';
var objList = [];
var colorlist = [];

var sdict = {};
var delDict = {};
var delindexlist = [];
var yearmonth = '';
var resultlist = []

var generateID = true;
var userID = '';

function generateUserId() {
    if (generateID) {
        var random_int = Math.floor(Math.random() * 1000) + 1
        var random_char = Math.random().toString(36).substring(7);

        userID = random_char + random_int;
        console.log(userID);
        generateID = false;
    }
}

setInterval(function() {

    var string_obj = JSON.stringify(resultlist);

    generateUserId();

    var jsonData = JSON.stringify({
        'data' : string_obj,
        'userID' : userID
    });

    $.ajax({
        type: "POST",
        url : "http://49.247.197.215:8885/fileSave",
        data : jsonData,
        contentType: 'application/json',
        success: function(m) {
            var rc = randomColor();
            $('.alarm').css('backgroundColor',rc);
            $('.alarm').css('borderColor',rc);
        }
    });

},60000); // 1m : 60000

$(document).keydown(function (event) {
    if (event.keyCode == '37') {
        if (modifystatus) {
            alert("수정 완료를 눌러 주세요.");
        } else {
            saveimagebox();
            objList = [];
            colorlist = [];
            delindexlist = [];
            loadImages(-1);
        }

    } else if (event.keyCode == '39') {
        if (modifystatus) {
            alert("수정 완료를 눌러 주세요.");
        } else {
            saveimagebox();
            objList = [];
            colorlist = [];
            delindexlist = [];
            loadImages(1);
        }
    } else if (event.keyCode == '13') {
        if (modifystatus) {
            alert("수정 완료를 눌러 주세요.");
        } else {
            if ($('#findindex').val() !== "") {
                findindex();
            }
        }
    } else if (event.keyCode == '16') {
        modifyBox();
    } else if (event.keyCode == '46') {
        offAll();
    }
});


function saveCache() {
    sdict[img_path] = objList;
}

function offAll() {

    for (var i=0; i<objList.length; i++){
        adddelindex(i);
    }

}
function modifyBox() {
    var status = $('#modify').attr('class');

    // 수정
    if (status == 'btn btn-outline-danger') {
        modifystatus = true;
        $('#modify').attr('class', 'btn btn-danger');

        $(".boundBox").resizable({
            disabled: false,
            handles: "n, e, s, w, ne, se, sw, nw"
        });

        $(".boundBox").draggable({
            disabled: false
        });

        $(".boundBox").off("click");
        $(".labelchange").css('display','block');
    }
    // 수정완료
    else {
        $('#modify').attr('class', 'btn btn-outline-danger')

        $(".boundBox").resizable({
            disabled: true
        });
        $(".boundBox").draggable({
            disabled: true
        });

        addOnevents();
        $(".labelchange").css('display','none');

        modifystatus = false;
    }
}

function findindex() {
    var i = document.getElementById("findindex").value;
    if (i !== '') {
        index = parseInt(i) - 1;
    }
    objList = [];
    colorlist = [];
    delindexlist = [];
    loadImages(0);

    $('#findindex').val("");
}

function saveimagebox() {
    saveCache();
    saveResizeBox();

    // sort delindexlist
    delindexlist.sort(function (a, b) {
        return a - b;
    });

    var saveDict = {};
    saveDict['img_path'] = img_path.replace('static/', "");
    saveDict['img_size'] = img_size;

    for (var i = 0; i < objList.length; i++) {

        if (delindexlist.indexOf(i) > -1) continue;

        var boxDict = {};
        boxDict['box'] = objList[i][0];
        boxDict['value'] = objList[i][1];
        saveDict['obj_' + i] = boxDict;
    }

    delDict[img_path] = delindexlist;
    // TODO
    for (var i = 0; i < resultlist.length; i++) {
        // 이미 저장된 값이 있는 경우 교체
        if (resultlist[i]['img_path'] == img_path.replace('static/', "")) {
            resultlist.splice(i, 1);
        }
    }

    resultlist.push(saveDict);

    if (Object.keys(delDict).length == 1) {
        startindex = index
    }

}

function resetdraw() {
    objList = [];
    colorlist = [];
    delindexlist = [];
    if (img_path in delDict) {
        delete delDict[img_path];
    }
    loadImages(0);
}

function adddelindex(i) {
    var e = document.getElementById('box_' + String(i));
    var label_e = document.getElementById('label_container_' + String(i));
    // 이미 있음
    if (delindexlist.indexOf(i) > -1) {
        delindexlist.splice(delindexlist.indexOf(i), 1);
        // 재생성
        e.style.display = "block";
        e.style.borderStyle = "solid";

        label_e.style.backgroundColor = colorlist[i];
        label_e.style.color = "white";
    }
    // 신규 인덱스
    else {
        delindexlist.push(i);
        //e.style.borderStyle = "none";
        e.style.display = "none";

        label_e.style.backgroundColor = "white";
        label_e.style.color = colorlist[i];
    }
}

// 연월 선택
function ymSelect(ym) {
    $('#ymselect').text(ym);
    index = 0;
    yearmonth = ym;
    loadLogFile(ym);

    var info = "1.  라벨이 clothing이라고 되어있으면 카테고리 디테일하게 변경해주세요! (top, bottom, onepiece 등)\n" +
        "- clothing 라벨로 되어있으면 나중에 전처리할 때 제거가 됩니당\n" +
        "\n" +
        "2. Hoodie 라벨도 top인지 outer인지 디테일 하게 변경 필요\n" +
        "\n" +
        "3. jewellery라고 되어있으면 necklace(목걸이)나 bracelet(팔찌), earring으로 변경\n" +
        "\n" +
        "4. 상품이 잘 안보이면 박스 모두 제거\n" +
        "(신발이 잘 안보이거나, 하의가 조금만 보일 때)\n" +
        "\n" +
        "5. 점프슈트의 경우도 원피스라벨로 지정\n" +
        "- 원피스의 의미는 상하의가 합쳐진 옷으로 생각하면 됩니다"
    //alert(info);
}

function loadLogFile(ym) {
    $.ajax({
        url: 'static/content_log/annotation_' + ym + '_uni.json',
        type: 'GET',
        dataType: 'json',
        success: function (data, indexcode) {
            listofjson = data
            indexcode = 0
            loadImages(indexcode)
        }
    });
} // logfile loader

// 기본 UI 생성
function loadImages(indexcode) {
    if (indexcode == 1) {
        index += 1;
        if (index == image_length) {
            alert('End');
            index == image_length;
        }
    } else if (indexcode == -1) {
        index -= 1;
        if (index == -1) {
            alert('Out of range');
            index = 0
        }
    }

    var txtDOM = "";
    var idxDOM = "";
    var lenDOM = "";
    var modifyDOM = "<button " +
        "style='margin-left: 5px;' " +
        "type='button' " +
        "data-status= 'false' " +
        "class='btn btn-outline-danger' " +
        "id ='modify' " +
        "onclick='modifyBox();'>" +
        "Modify</button>";

    var resetDOM = "<button " +
        "style='margin-left: 183px;' type='button' " +
        "class='btn btn-outline-info' " +
        "id ='reset' onclick='resetdraw();'>" +
        "Reset</button>";

    var insertDOM = "<button " +
        "style='margin-left: 5px;' type='button' " +
        "class='btn btn-outline-danger' " +
        "id ='insert' " +
        "onclick='labelSelect();'>" +
        "Insert</button>";

    var offDOM = "<button " +
        "style='margin-left: 5px;' type='button' " +
        "class='btn btn-outline-dark' " +
        "id ='off' " +
        "onclick='offAll();'>" +
        "OFF</button>";

    img_path = 'static/' + listofjson[index].img_path;
    img_size = listofjson[index].img_size;
    var image_length = listofjson.length

    for (k in listofjson[index]) {
        if (k.match('obj_')) {
            objList.push([listofjson[index][k].box, listofjson[index][k].value]);
        }
    }

    // N번째 이미지 패널을 생성
    txtDOM += "<span class='badge badge-pill badge-success' style='margin: 4px;' id='text_container'>";
    txtDOM += '' + "<p class='h6' style='margin: 4px;'>" + img_path.split('/')[3] + "</p>";
    txtDOM += '' + "</span>";

    idxDOM += "<span class='badge badge-pill badge-warning' style='margin: 4px;' id='index_container'>";
    idxDOM += '' + "<p style='margin: 4px;'>" + (index + 1) + "</p>";
    idxDOM += '' + "</span>";

    lenDOM += "<span class='badge badge-pill badge-dark' style='margin: 4px;' id='length_container'>";
    lenDOM += '' + "<p style='margin: 4px;'>" + image_length + "</p>";
    lenDOM += '' + "</span>";

    // 이미지 컨테이너에 생성한 이미지 패널들을 추가하기
    var $imageContainer = $(".image_container");
    $imageContainer.attr('onload', drawBox());
    var $textContainer = $("#text_container");
    $textContainer.replaceWith(txtDOM);
    var $indexContainer = $("#index_container");
    $indexContainer.replaceWith(idxDOM);
    var $lengthContainer = $("#length_container");
    $lengthContainer.replaceWith(lenDOM);
    var $resetContainer = $("#reset_container");
    $resetContainer.replaceWith(resetDOM);
    var $modifyContainer = $("#modify_container");
    $modifyContainer.replaceWith(modifyDOM);
    var $insertContainer = $("#insert_container");
    $insertContainer.replaceWith(insertDOM);
    var $offContainer = $("#off_container");
    $offContainer.replaceWith(offDOM);
}

function resizeRatio(img_w, img_h) {

    var border_length = 750;
    var rr = 1;
    if (img_w > img_h) {
        if (img_w > border_length) {
            rr = border_length / img_w;
            img_h = rr * img_h;
            img_w = border_length;
        }
    } else {
        if (img_h > border_length) {
            rr = border_length / img_h;
            img_w = rr * img_w;
            img_h = border_length;
        }
    }

    return {img_w: img_w, img_h: img_h, resize_ratio: rr}
}

function drawBox() {
    var x1 = 0;
    var y1 = 0;
    var w = 0;
    var h = 0;

    var img_w = resizeRatio(img_size[0], img_size[1]).img_w;
    var img_h = resizeRatio(img_size[0], img_size[1]).img_h;
    var rr = resizeRatio(img_size[0], img_size[1]).resize_ratio;
    rR = rr;

    if (img_path in delDict) {
        delindexlist = delDict[img_path];
    }

    if (img_path in sdict) {
        objList = sdict[img_path];
    }

    makecolorlist();

    // Image DOM
    var imageDOM = "<div class='image_container' style='width: 800px; height: 800px;'>"
    imageDOM += "" + "<img style='width:" + img_w + "px; height:" + img_h + "px;' src='" + img_path + "' />";
    imageDOM += "" + "<div class='resize-container'>";
    // Label DOM
    var labelDOM = "<div class='label_container btn-group-toggle' data-toggle='buttons'>";
    // For boxes
    var bboxDOM = "";

    // Select DOM
    var selectDOM = "<div style='margin-left: 10px;' class=\"select_container\">";

    for (var i = 0; i < objList.length; i++) {

        x1 = objList[i][0][0] * rr;
        y1 = objList[i][0][1] * rr;
        w = (objList[i][0][2] - objList[i][0][0]) * rr;
        h = (objList[i][0][3] - objList[i][0][1]) * rr;

        if (delindexlist.indexOf(i) > -1) {
            // unchecked
            bboxDOM += "<div " +
                "style='background-color: transparent; display: none; z-index: 1; border: 4px solid " + colorlist[i] + "; position: absolute; left: " + x1 + "px; top: " + y1 + "px; width: " + w + "px; height: " + h + "px;' " +
                "class='boundBox ui-widget-content' " +
                "data-box_no = '" + i + "'" +
                "id='box_" + i + "'></div>";

            labelDOM += '' + "<p><input type='button' " +
                "onclick='adddelindex(" + i + ")' " +
                "onmouseover='highlight(" + i + ");' " +
                "onmouseleave='dehighlight(" + i + ");' " +
                "class='btn btn-primary' " +
                "style='margin-left: 20px; background-color: white; color: " + colorlist[i] + "; border-color: " + colorlist[i] + ";' " +
                "value='" + i + " " + objList[i][1] + "' " +
                "id='label_container_" + i + "' ></p>";

            selectDOM += '<div class="btn-group">' +
                "<button style='display: none; margin-bottom: 16px;' class=\"labelchange sel_"+ i +" btn btn-outline-secondary dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\"\n" +
                "aria-haspopup=\"true\" aria-expanded=\"false\">\n" +
                "</button>\n" +
                "<div class=\"dropdown-menu sel_"+ i +"\">\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Outer')\">Outer</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Top')\">Top</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Bottom')\">Bottom</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Onepiece')\">Onepiece</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Bag')\">Bag</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Shoe')\">Shoe</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Belt')\">Belt</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Hat')\">Hat</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Bracelet')\">Bracelet</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Glasses')\">Glasses</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Necklace')\">Necklace</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Necktie')\">Necktie</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Watch')\">Watch</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Earring')\">Earring</a>" +
                "</div></div><br>";
        } else {
            // checked
            bboxDOM += "<div " +
                "style='background-color: transparent; display: block; z-index: 1; border: 4px solid " + colorlist[i] + "; position: absolute; left: " + x1 + "px; top: " + y1 + "px; width: " + w + "px; height: " + h + "px;' " +
                "class='boundBox ui-widget-content' " +
                "data-box_no = '" + i + "'" +
                "onload='modifyBox(" + i + ")' " +
                "id='box_" + i + "'></div>";

            labelDOM += '' + "<p><input type='button' " +
                "onclick='adddelindex(" + i + ")' " +
                "onmouseover='highlight(" + i + ");' " +
                "onmouseleave='dehighlight(" + i + ");' " +
                "class='btn btn-primary' " +
                "style='margin-left: 20px; background-color: " + colorlist[i] + "; color: white; border-color: " + colorlist[i] + ";' " +
                "value='" + i + " " + objList[i][1] + "' " +
                "id='label_container_" + i + "' ></p>";

            selectDOM += '<div class="btn-group">' +
                "<button style='display: none; margin-bottom: 16px;' class=\"labelchange sel_"+ i +" btn btn-outline-secondary dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\"\n" +
                "aria-haspopup=\"true\" aria-expanded=\"false\">\n" +
                "</button>\n" +
                "<div class=\"dropdown-menu sel_"+ i +"\">\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Outer')\">Outer</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Top')\">Top</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Bottom')\">Bottom</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Onepiece')\">Onepiece</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Bag')\">Bag</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Shoe')\">Shoe</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Belt')\">Belt</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Hat')\">Hat</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Bracelet')\">Bracelet</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Glasses')\">Glasses</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Necklace')\">Necklace</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Necktie')\">Necktie</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Watch')\">Watch</a>\n" +
                    "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Earring')\">Earring</a>" +
                "</div></div><br>";
        }
    }

    labelDOM += "</div>";
    bboxDOM += "" + "</div></div>";
    imageDOM += bboxDOM;
    selectDOM += "</div>";

    var $imageContainer = $(".image_container");
    $imageContainer.replaceWith(imageDOM);
    var $labelContainer = $(".label_container");
    $labelContainer.replaceWith(labelDOM);
    var selectContainer = $(".select_container");
    selectContainer.replaceWith(selectDOM);

    // Add on events
    addOnevents();

}

function addOnevents() {
    $(".boundBox").on("click", function () {
        var i = $(this).data("box_no");
        adddelindex(i);
    });

    $(".boundBox").on("mouseover", function () {
        var i = $(this).data("box_no");
        highlight(i);
    });

    $(".boundBox").on("mouseleave", function () {
        var i = $(this).data("box_no");
        dehighlight(i);
    });
}

function labelSelect() {
    $('.label').css('display', 'inline-block');
    $('.label').text('Category');
}

function insertBox(label) {

    if (modifystatus) {

        // Label DOM
        var labelDOM = "";
        // For boxes
        var bboxDOM = "";
        // Select
        var selectDOM = "";

        var i = objList.length;
        objList.push([[0, 0, 0, 0], label])
        color = randomColor();
        colorlist.push(color);

        // default box
        var x1 = 10;
        var y1 = 10;
        var w = 100;
        var h = 100;

        bboxDOM += "<div " +
            "style='background-color: transparent; display: block; z-index: 1; border: 4px solid " + colorlist[i] + "; position: absolute; left: " + x1 + "px; top: " + y1 + "px; width: " + w + "px; height: " + h + "px;' " +
            "class='boundBox ui-widget-content' " +
            "data-box_no = '" + i + "'" +
            "onload='modifyBox(" + i + ")' " +
            "id='box_" + i + "'></div>";

        labelDOM += '' + "<p><input type='button' " +
            "onclick='adddelindex(" + i + ")' " +
            "onmouseover='highlight(" + i + ");' " +
            "onmouseleave='dehighlight(" + i + ");' " +
            "class='btn btn-primary' " +
            "style='margin-left: 20px; background-color: " + colorlist[i] + "; color: white; border-color: " + colorlist[i] + ";' " +
            "value='" + i + " " + objList[i][1] + "' " +
            "id='label_container_" + i + "' ></p>";

        selectDOM += '<div class="btn-group">' +
            "<button style='display: none; margin-bottom: 16px;' class=\"labelchange sel_" + i + " btn btn-outline-secondary dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\"\n" +
            "aria-haspopup=\"true\" aria-expanded=\"false\">\n" +
            "</button>\n" +
            "<div class=\"dropdown-menu sel_" + i + "\">\n" +
            "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Outer')\">Outer</a>\n" +
            "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Top')\">Top</a>\n" +
            "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Bottom')\">Bottom</a>\n" +
            "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Onepiece')\">Onepiece</a>\n" +
            "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Bag')\">Bag</a>\n" +
            "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Shoe')\">Shoe</a>\n" +
            "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Belt')\">Belt</a>\n" +
            "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Hat')\">Hat</a>\n" +
            "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Bracelet')\">Bracelet</a>\n" +
            "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Glasses')\">Glasses</a>\n" +
            "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Necklace')\">Necklace</a>\n" +
            "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Necktie')\">Necktie</a>\n" +
            "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Watch')\">Watch</a>\n" +
            "<a class=\"dropdown-item\" href=\"javascript:changeLabel(" + i + ",'Earring')\">Earring</a>" +
            "</div></div><br>";

        var $imageContainer = $(".image_container");
        $imageContainer.append(bboxDOM);
        var $labelContainer = $(".label_container");
        $labelContainer.append(labelDOM);
        var selectContainer = $(".select_container");
        selectContainer.append(selectDOM);

        // Add on events
        addOnevents();

        $('#box_' + i).resizable({
            disabled: false,
            handles: "n, e, s, w, ne, se, sw, nw"
        });

        $('#box_' + i).draggable({
            disabled: false
        });

        $('#box_' + i).off("click");

        $(".labelchange").css('display', 'block');
        $('.label').css('display', 'none');
    }
    else {
        alert("수정 버튼을 눌러 주세요.")
    }
}

function changeLabel(i , label){
    $('#label_container_' + i).val(i + " " + label);
    objList[i][1] = label;
}

function highlight(i) {

    $('#box_' + i).css('border', 'border: 6px solid ' + colorlist[i]);
    $('#box_' + i).css('backgroundColor', hexToRgba(colorlist[i], 0.5));

    if (!$('#box_' + i).children('p').length > 0 && !(delindexlist.includes(i))) {
        var label = document.createElement("p");
        label.setAttribute('style', 'text-align: center; color: white; font-family: Comic Sans MS; font-size: 35px;');
        label.setAttribute('class', 'label-text');
        label.textContent = objList[i][1];

        $('#box_' + i).append(label)
    }
}

function dehighlight(i) {

    $('#box_' + i).css('border', 'border: 4px solid ' + colorlist[i]);
    $('#box_' + i).css('backgroundColor', 'transparent');
    $('.label-text').remove();
}

function makecolorlist() {
    for (i = 0; i < objList.length; i++) {
        color = randomColor();
        colorlist.push(color);
    }
}

function randomColor() {
    var colorcode = "#000000".replace(/0/g, function () {
        return (~~(Math.random() * 16)).toString(16);
    });
    return colorcode

}

function hexToRgba(hex, opacity) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return "rgba(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + ", " + opacity + ")";
}

function saveResizeBox() {
    for (var i = 0; i < objList.length; i++) {
        var obj = $("#box_" + String(i))[0].style;

        var x1 = parseInt(obj.left, 10);
        var y1 = parseInt(obj.top, 10);
        var w = parseInt(obj.width, 10);
        var h = parseInt(obj.height, 10);

        objList[i][0][0] = x1 / rR;
        objList[i][0][1] = y1 / rR;
        objList[i][0][2] = (x1 + w) / rR;
        objList[i][0][3] = (y1 + h) / rR;
    }
}


function makedownload() {
    saveimagebox();

    var string_obj = JSON.stringify(resultlist)
    var filename = String(yearmonth) + "/" + String(startindex + 1) + "_" + String(index + 1) + ".json"
    var dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(string_obj);
    $("#link").attr("href", dataUri);
    $("#link").attr("download", filename);
}
