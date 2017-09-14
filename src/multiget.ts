#!/usr/bin/env node

import * as http from 'http'
import * as request from 'request'
import * as config from 'commander'
import * as fs from 'fs'


function main() {
    parseCommandLine();

    if(!config.url) {
        console.log("  Error: <url> argument is required");
        process.exit(1);
    }

    // Get the desired segment and write to file
    console.log(`  Getting first ${config.chunkCount} chunks of size ${config.chunkSize}KB`);
    console.log(`  Source: ${config.url}\n  Dest: ${config.output}`);
    MultiGetter.getChunkSequence(config.url, config.chunkCount, config.chunkSize, (buff) => {
        fs.writeFileSync(config.output, buff, "binary");
    });
}

function parseCommandLine(): void {
    config
        .option("-o, --output <outfile>", "File to write output to", "default.out")
        .option("-c, --chunk-count <count>", "Number of chunks to download", (v)=>parseInt(v), 4)
        .option("-s, --chunk-size <size>", "Size of each chunk (in KB)", (v)=>parseInt(v), 1024)
        .arguments("<url>")
        .action((url) => {
            config.url = url;
        })
        .parse(process.argv);
}

/**
 * Class with some static functions to get a sequence of range requests
 * I'm just using a class to hide the helper functions from being public
 */
class MultiGetter {
    public static getChunkSequence(url: string, chunk_count: number, chunk_size: number, callback: (b: Buffer) => any ): void {
        let result = new Array(chunk_count);
        let count = 0;
        for(let i=0; i<chunk_count; i++) {
            let start = this.kbToByte(chunk_size) * i;
            let end = start + this.kbToByte(chunk_size) - 1;

            this.getRange(url, start, end, (body) => {
                result[i] = body;
                if(++count == chunk_count) {
                    callback(Buffer.concat(result));
                }
            });
        }
    }

    private static getRange(url: string, start: number, end: number, callback: (s: Buffer) => any): void {
        var options = {
            url: url,
            encoding: null, /* Required to receive binary data */
            headers: { 'Range': `bytes=${start}-${end}` } /* Set the range header */
        };
        
        request(options, (err, response, body) => {
            if(err) { console.log("Error requesting from " + url); process.exit(1); }
            else { 
                callback(body) 
            }
        });
    }
    
    private static kbToByte(n: number): number {
        return n*1024;
    }
}

main();