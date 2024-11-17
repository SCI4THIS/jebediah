pushd bash
git apply ../bash.patch
popd

mkdir -p build-bash
cp make-build.sh build-bash/make-build.sh
cp rebuild-bash-wasm.sh build-bash/rebuild-bash-wasm.sh

pushd build-bash
CC=clang ../bash/configure
make
make clean
# this generates pathnames.h, but then removes all the other intermediate steps.
./make-build.sh
make
./rebuild-bash-wasm.sh
popd

cp build-bash/bash.wasm src/bash.wasm
