var fs = require('fs'),
    path = require('path'),
    imagemin = require('imagemin'),
    imageminSvgo = require('imagemin-svgo'),
    imageminJpegtran = require('imagemin-jpegtran'),
    imageminGifsicle = require('imagemin-gifsicle'),
    imageminOptipng = require('imagemin-optipng'),


    rootPath = process.env.RootPath,

    debug = true,

    successCounter = 0,
    errorCounter = 0,
    notProcessedCounter = 0,
    pendingCounter = 0,

    hasStartedProcessing = false;

if(!rootPath) return;

console.log('minify STARTING - minifying your images. Sit back and relax!');


function processFiles(dir, _noRecursive) {
    fs.readdir(dir, function (err, list) {
        if (err) {
            // console.error('processFiles - reading directories error: ' + err);
            return;
        }
        list.forEach(function(file) {
            file = path.join(dir, file);
            fs.stat(file, function(err, stat) {
                hasStartedProcessing = true;
                if (stat.isDirectory()) {
                    if (!_noRecursive) processFiles(file);
                } else {
                    compress(file, dir);
                }
            });
        });
    });
}

function compress(file, dir) {
    var outDir = path.join(dir, 'output'),
        ext = path.extname(file);
    switch(ext.toLowerCase()) {
        // Image options https://github.com/imagemin/imagemin
        case '.svg':
            (debug) && console.log('Minifying SVG File: ' + file);
            pendingCounter++;
            // svgGo options https://www.npmjs.com/package/imagemin-svgo#options
            imagemin([file], outDir, {use: [imageminSvgo()]}).then((files) => {
                if (!files || files.length == 0) {
                    errorCounter++;
                    console.error('\x1b[31mEncountered an error minifying a file: %s\x1b[0m', file);
                }
                else {
                    (debug) && console.log('Optimized: ' + file);
                }
                pendingCounter--;
            });
            successCounter++;
            break;
        case '.gif':
            (debug) && console.log('Minifying GIF File: ' + file);
            pendingCounter++;
            // GifSicle options https://www.npmjs.com/package/imagemin-gifsicle#options
            imagemin([file], outDir, {use: [imageminGifsicle({interlaced: true})]}).then((files) => {
                if (!files || files.length == 0) {
                    errorCounter++;
                    console.error('\x1b[31mEncountered an error minifying a file: %s\x1b[0m', file);
                }
                else {
                    (debug) && console.log('Optimized: ' + file);
                }
                pendingCounter--;
            });
            successCounter++;
            break;
        case '.png':
            (debug) && console.log('Minifying PNG File: ' + file);
            pendingCounter++;
            // OptiPNG options https://www.npmjs.com/package/imagemin-optipng#options
            imagemin([file], outDir, {use: [imageminOptipng({optimizationLevel: 2})]}).then((files) => {
                if (!files || files.length == 0) {
                    errorCounter++;
                    console.error('\x1b[31mEncountered an error minifying a file: %s\x1b[0m', file);
                }
                else {
                    (debug) && console.log('Optimized: ' + file);
                }
                pendingCounter--;
            });
            successCounter++;
            break;
        case '.jpg':
        case '.jpeg':
            (debug) && console.log('Minifying JPEG File: ' + file);
            pendingCounter++;
            // jpegTran options https://www.npmjs.com/package/imagemin-jpegtran#options
            imagemin([file], outDir, {use: [imageminJpegtran({progressive: true})]}).then((files) => {
                pendingCounter--;
                (debug) && console.log('Optimized: ' + file);
            });
            successCounter++;
            break;
        default:
            console.error('Encountered file with ' + ext + ' extension - not compressing.');
            notProcessedCounter++;
            break;
    }
}

function checkIfFinished() {
    if (hasStartedProcessing && pendingCounter == 0) console.log('\x1b[36m%s %s %s\x1b[0m', successCounter + (successCounter == 1 ? ' file ' : ' files ') + 'minified.', errorCounter + (errorCounter == 1 ? ' file ' : ' files ') + 'had errors.', notProcessedCounter + (notProcessedCounter == 1 ? ' file was ' : ' files were ') + 'not processed.');
    else setTimeout(checkIfFinished, 10);
}

processFiles(rootPath, true);

checkIfFinished();