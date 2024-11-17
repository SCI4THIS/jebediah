#!/bin/bash

make -n | sed s/^make.*:\ Entering\ directory/pushd/g | sed s/^make.*:\ Leaving\ directory.*$/popd/g | sed s/^make.*$//g > build.sh

cat build.sh | sed s/-I\.\[\ \\\t\]/-I\\\/home\\\/A\\\/emsdk\\\/upstream\\\/emscripten\\\/cache\\\/sysroot\\\/include\ -I\.\ /g | sed s/-c/-c\ --target=wasm32\ -emit-llvm\ -S/g > build-mod.sh

