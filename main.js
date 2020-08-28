
var streetsLayer = new ol.layer.Tile({
    title: "streets",
    source: new ol.source.OSM()
});

var satelliteLayer = new ol.layer.Tile({
    title: "satellites",
    source: new ol.source.XYZ({
        url: "https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYXJpY2hhIiwiYSI6ImNrZTdqbWo2ZjFuZnIzNW80cW5mY3hic28ifQ.lwwOhC18IW8SBzqUqOAhWQ",
        attributions: "<a href='http://www.mapbox.com'>mapbox</a>"
    })
});

const centerCoord = [119.3, 18.7];
const centerM = ol.proj.fromLonLat(centerCoord);

var map = new ol.Map({
    layers: [
        streetsLayer,
        satelliteLayer
    ],
    target: "map",
    view: new ol.View({
        center: centerM,
        zoom: 6,
    })
})
map.addControl(new ol.control.LayerSwitcher());

function dataHandler() {
    var forecast = typhoonTestData[0]['points'];
    var polylinePoints = [];
    for (var i = 0; i < forecast.length; i++) {
        var p = forecast[i];
        //polylinePoints.push([Number(p['lat']), Number(p['lng'])]);
        var newCoord = [Number(p['lng']), Number(p['lat'])];
        newCoordTrans = ol.proj.fromLonLat(newCoord);
        polylinePoints.push(newCoordTrans);
    }
    return polylinePoints;
}

var typLine = dataHandler();
var count = 2;
var length = typLine.length;
var drawPoints = new ol.geom.LineString([typLine[0], typLine[1]]);

var iconStyle = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 0.8,
        scale: 0.8,
        src: "./typhoon.png"
    })
});

var lineStyle=new ol.style.Style({
    stroke: new ol.style.Stroke({
        width: 6,
        color: [237, 212, 0, 0.8],
      }),
})

var lineLayer;
var iconFeature;
function animationLine() {
    if (count == length) return false;
    drawPoints.appendCoordinate(typLine[count]);
    map.removeLayer(lineLayer);
    iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(typLine[count])
    });
    iconFeature.setStyle(iconStyle);
    lineFeature=new ol.Feature(drawPoints);
    lineFeature.setStyle(lineStyle);
    lineLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [
                lineFeature,
                iconFeature
            ]
        })
    })
    map.addLayer(lineLayer);
    count++;
}

setInterval(animationLine,50);

land=typhoonTestData[0]['land'][0];

var container = document.getElementById("popup");
var content = document.getElementById("popup-content");
var popupCloser = document.getElementById("popup-closer");

var overlay = new ol.Overlay({
    //设置弹出框的容器
   element: container,
   //是否自动平移，即假如标记在屏幕边缘，弹出时自动平移地图使弹出框完全可见
   autoPan: true
});

map.on('click',function(e){
    //在点击时获取像素区域
    var pixel = map.getEventPixel(e.originalEvent);
    map.forEachFeatureAtPixel(pixel,function(feature){
        //coodinate存放了点击时的坐标信息
        var coodinate = e.coordinate;
        //设置弹出框内容，可以HTML自定义
        content.innerHTML = "<b>" + typhoonTestData[0]['name'] +
        "</b><br>"+land['info']+"<br>"+land['landtime']+"<br>经度："+land['lng']+"<br>纬度："+land['lat']+"<br>强度："+land['strong']+"<br><br><b>Author：jiarong<b>"
        //设置overlay的显示位置
        overlay.setPosition(coodinate);
        //显示overlay
        map.addOverlay(overlay);
    });
});
