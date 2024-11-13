# Note make sure to run with mingw-64 and not msys-64

BUILD_DIR=build-wasm3

mkdir -p ${BUILD_DIR}

rm ${BUILD_DIR}/*\.ll

for FILE in `ls wasm3/source/m3*\.c | grep -Ev wasi | grep -Ev libc` src/wasm-glue.c
do
  clang -Iwasm3/source -I/home/A/emsdk/upstream/emscripten/cache/sysroot/include --target=wasm32 -emit-llvm -c -S $FILE -o ${BUILD_DIR}/`basename ${FILE}`.ll
done


rm ${BUILD_DIR}/*\.o

for FILE in `ls ${BUILD_DIR}/*\.ll`
do
  llc -march=wasm32 -filetype=obj $FILE
done

/home/A/emsdk/upstream/bin/wasm-ld.exe --no-entry --import-undefined --export-all -o ${BUILD_DIR}/wasm3-temp.wasm `ls ${BUILD_DIR}/*\.o`
#/home/A/emsdk/upstream/bin/wasm-ld.exe --no-entry --import-undefined --export-all --allow-undefined -o wasm3-temp.wasm `ls *\.o`

/home/A/wabt/bin/wasm2wat.exe ${BUILD_DIR}/wasm3-temp.wasm > ${BUILD_DIR}/wasm3.wat
/home/A/wabt/bin/wat2wasm.exe -o ${BUILD_DIR}/wasm3.wasm ${BUILD_DIR}/wasm3.wat

/home/A/binaryen/build/bin/wasm-opt.exe -O1 --asyncify ${BUILD_DIR}/wasm3.wasm -o ${BUILD_DIR}/wasm3-asyncify.wasm

cp ${BUILD_DIR}/wasm3-asyncify.wasm src/wasm3-asyncify.wasm
