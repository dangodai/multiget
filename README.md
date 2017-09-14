# Multiget

Multi-GET coding challenge. Note: I assume *nix environment. My build script runs ```chmod +x``` after compiling the TypeScript. 

## Install
```sh
$ git clone https://github.com/dangodai/multiget.git
$ npm install
$ npm run build
```

The .js output will be in dist/multiget.js

## Usage

```sh
./dist/multiget.js [options] <url>
```

The default options match the given requirements (chunk size of 1MB, 4 chunks)

#### Options

| Option | Details |
| ------ | ------ |
| -o, --output \<outfile\> | The file to write output to (Default: default.out) |
| -c, --chunk-count \<count\> | The number of chunks to download (Default: 4) |
| -s, --chunk-size \<size\> | The size of each chunk in kB (Default: 1024) |
| -h, --help | Prints this help menu |
