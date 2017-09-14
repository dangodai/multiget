#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var request = require("request");
var config = require("commander");
var fs = require("fs");
function main() {
    parseCommandLine();
    if (!config.url) {
        console.log("  Error: <url> argument is required");
        process.exit(1);
    }
    console.log("  Getting first " + config.chunkCount + " chunks of size " + config.chunkSize + "KB");
    console.log("  Source: " + config.url + "\n  Dest: " + config.output);
    MultiGetter.getChunkSequence(config.url, config.chunkCount, config.chunkSize, function (buff) {
        fs.writeFileSync(config.output, buff, "binary");
    });
}
function parseCommandLine() {
    config
        .option("-o, --output <outfile>", "File to write output to", "default.out")
        .option("-c, --chunk-count <count>", "Number of chunks to download", function (v) { return parseInt(v); }, 4)
        .option("-s, --chunk-size <size>", "Size of each chunk (in KB)", function (v) { return parseInt(v); }, 1024)
        .arguments("<url>")
        .action(function (url) {
        config.url = url;
    })
        .parse(process.argv);
}
var MultiGetter = (function () {
    function MultiGetter() {
    }
    MultiGetter.getChunkSequence = function (url, chunk_count, chunk_size, callback) {
        var result = new Array(chunk_count);
        var count = 0;
        var _loop_1 = function (i) {
            var start = this_1.kbToByte(chunk_size) * i;
            var end = start + this_1.kbToByte(chunk_size) - 1;
            this_1.getRange(url, start, end, function (body) {
                result[i] = body;
                if (++count == chunk_count) {
                    callback(Buffer.concat(result));
                }
            });
        };
        var this_1 = this;
        for (var i = 0; i < chunk_count; i++) {
            _loop_1(i);
        }
    };
    MultiGetter.getRange = function (url, start, end, callback) {
        var options = {
            url: url,
            encoding: null,
            headers: { 'Range': "bytes=" + start + "-" + end }
        };
        request(options, function (err, response, body) {
            if (err) {
                console.log("Error requesting from " + url);
                process.exit(1);
            }
            else {
                callback(body);
            }
        });
    };
    MultiGetter.kbToByte = function (n) {
        return n * 1024;
    };
    return MultiGetter;
}());
main();
