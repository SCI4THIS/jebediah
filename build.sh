#!/bin/bash

#./compile-hello.sh
#./compile-wasm3.sh
#./compile-sleep.sh

cp tarballjs/tarball.js src/tarball.js

mkdir -p tar-staging

for file in "gl.js" "sys.js" "wasm3-wasm.js" "wasm3-asyncify.wasm" "hello.wasm" "sleep.wasm" "bash.wasm"
do
  cp src/${file} tar-staging/${file}
done

tar -czvf src/jebediah.tar.gz -C tar-staging/ .

echo "\"data:application/wasm;base64,`base64 --wrap=0 src/jebediah.tar.gz`\"" > jebediah.tar.gz.b64

sed -f amalgamate_tarballjs.sed src/index.html > tmp1.js
sed -f amalgamate_jebediah.tar.gz.sed tmp1.js > tmp2.js
sed s/is_staging\:\ true/is_staging\:\ false/g tmp2.js > tmp3.js

mv tmp3.js index.html
rm tmp2.js
rm tmp1.js
rm jebediah.tar.gz.b64
rm src/jebediah.tar.gz
