const ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');
var path = require('path');


var vname = '6619626578831740000';
var input = './input';
var output = './output';
var middle = './middle';

// 用 endingH 生成 endingW 视频
// ffmpeg(path.join(__dirname, middle, `endingH.mp4`))
// .size('960x540').autopad('black')
// .on('error', function (err) {
//     console.log('生成endingW视频发生错误: ' + err.message);
// }).on('end', function () {
//     console.log('生成endingW视频成功');
// }).save(path.join(__dirname, middle, `endingW.mp4`));


new Promise((resolve) => {

    ffmpeg(path.join(__dirname, input, `${vname}.mp4`))
    .ffprobe(0, function(err, metadata) {
        !!err && console.log('无法读取视频大小:' + err.message);
        var endName = metadata.streams[0].height > 600 ? 'endingH' : 'endingW';
        var out = fs.createWriteStream(path.join(__dirname, middle, 'input.txt'), 'utf8');
        out.write(`file '${path.join(__dirname, input, vname)}.mp4'\nfile '${path.join(__dirname, middle, endName)}.mp4'`)
        out.end;
        out.on('ready', function () {
            console.log('创建文本成功');
             resolve();
        });
    });

})
.then(() => {

    return new Promise((resolve) => {
        ffmpeg(path.join(__dirname, middle,'input.txt'))
        .inputOptions(
            '-f','concat',
            '-safe','0'
        ).on('error', function (err) {
            console.log('合并视频发生错误: ' + err.message);
        }).on('end', function () {
            console.log('合并视频成功');
            resolve();
        }).save(path.join(__dirname, middle, 'first.mp4'));
    });
    
})
.then(() => {

    return new Promise((resolve) => {
        ffmpeg(path.join(__dirname, middle, 'first.mp4'))
        .input(path.join(__dirname, middle, 'logo.png'))
        .inputOptions(
            '-filter_complex','overlay=10:10'
        ).on('error', function (err) {
            console.log('水印添加错误: ' + err.message);
        }).on('end', function () {
            console.log('水印添加成功');
            resolve();
        }).save(path.join(__dirname, middle, 'second.mp4'));
    });

})
.then(() => {

    return new Promise((resolve) => {
        ffmpeg(path.join(__dirname, middle, 'second.mp4'))
        .videoFilters("drawtext=fontfile=simhei.ttf:text='tttttTTT':x=100:y=10:fontsize=24:fontcolor=yellow:shadowy=2")
        .on('error', function (err) {
            console.log('文字水印添加错误: ' + err.message);
        }).on('end', function () {
            console.log('文字水印添加成功');
            resolve();
        }).save(path.join(__dirname, output, `${vname}.mp4`));
    });

})
.then(() => {
    console.log(path.join(__dirname, output, `${vname}.mp4`));
})
