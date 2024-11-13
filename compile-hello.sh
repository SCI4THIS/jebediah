#!/bin/bash

BUILD_DIR=build-hello

mkdir -p ${BUILD_DIR}

clang -o ${BUILD_DIR}/hello.c.ll -I/home/A/emsdk/upstream/emscripten/cache/sysroot/include --target=wasm32 -emit-llvm -c -S src/hello.c

llc -o ${BUILD_DIR}/hello.c.ll.o -march=wasm32 -filetype=obj ${BUILD_DIR}/hello.c.ll
/home/A/emsdk/upstream/bin/wasm-ld.exe --no-entry --import-undefined --export-all -o ${BUILD_DIR}/hello-temp.wasm ${BUILD_DIR}/hello.c.ll.o

/home/A/wabt/bin/wasm2wat.exe ${BUILD_DIR}/hello-temp.wasm > ${BUILD_DIR}/hello.wat
/home/A/wabt/bin/wat2wasm.exe -o ${BUILD_DIR}/hello.wasm ${BUILD_DIR}/hello.wat
cp ${BUILD_DIR}/hello.wasm src/hello.wasm
