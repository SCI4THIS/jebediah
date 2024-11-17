#!/bin/bash

PROG=bash

pushd builtins
rm *\.ll
for BUILTIN in alias bind break builtin caller cd colon command declare echo enable eval exec exit fc fg_bg hash help history jobs kill let mapfile pushd read return set setattr shift source suspend test times trap type ulimit umask wait shopt printf complete
do
  ./mkbuiltins.exe -D ../../bash/builtins ../../bash/builtins/${BUILTIN}.def
  CMD="clang -DSHELL -DHAVE_CONFIG_H -I/home/A/emsdk/upstream/emscripten/cache/sysroot/include -I. -I../ -I../../bash -I../../bash/builtins -I../../bash/include -I../../bash/lib -Wno-parentheses -Wno-format-security -g -O2 -c --target=wasm32 -emit-llvm -S ${BUILTIN}.c"
  echo ${CMD}
  ${CMD}
done
./mkbuiltins.exe -D ../../bash/builtins ../../bash/builtins/getopts.def
CMD="clang -DSHELL -DHAVE_CONFIG_H -I. -I../ -I../../bash -I../../bash/builtins -I../../bash/include -I../../bash/lib -I/home/A/emsdk/upstream/emscripten/cache/sysroot/include -Wno-parentheses -Wno-format-security -g -O2 -c --target=wasm32 -emit-llvm -S getopts.c"
echo ${CMD}
${CMD}

for BUILTIN in common getopt evalstring bashgetopt evalfile
do
CMD="clang -DSHELL -DHAVE_CONFIG_H -I. -I../ -I../../bash -I../../bash/builtins -I../../bash/include -I../../bash/lib -I/home/A/emsdk/upstream/emscripten/cache/sysroot/include -Wno-parentheses -Wno-format-security -g -O2 -c --target=wasm32 -emit-llvm -S ../../bash/builtins/${BUILTIN}.c"
echo ${CMD}
${CMD}
done

rm *\.o
for FILE in `ls *\.ll`
do
  CMD="llc -march=wasm32 -filetype=obj $FILE"
  echo ${CMD}
  ${CMD}
done
popd

pushd lib/sh
rm *\.ll
for ARG in `grep "^ar" ../../build.sh | grep libsh.a`
do
  echo "ARG: ${ARG}"
  CHECK=`echo ${ARG} | grep .*\\\.o | wc -l`
  echo "CHECK: ${CHECK}"
  if [ ${CHECK} -eq 1 ];
  then
    CFILE=`echo ${ARG} | sed s/\\\.o/\\\.c/g`
    echo "CFILE: ${CFILE}"
    CMD=`grep "bash/lib/sh/${CFILE}" ../../build.sh | sed s/\ \-c/\ \-c\ \-\-target=wasm32\ \-emit\-llvm\ \-S/g | sed s/HAVE_CONFIG_H/HAVE_CONFIG_H\ \-I\\\/home\\\/A\\\/emsdk\\\/upstream\\\/emscripten\\\/cache\\\/sysroot\\\/include\ \-I\\\/home\\\/A\\\/jebediah\\\/bash\\\/lib\\\/termcap/g | head -n1`
    echo ${CMD}
    ${CMD}
  fi
done
rm *\.o

for FILE in `ls *\.ll`
do
  llc -march=wasm32 -filetype=obj $FILE
done
popd

pushd lib/glob
rm *\.ll
for ARG in `grep "^ar" ../../build.sh | grep libglob.a`
do
  echo "ARG: ${ARG}"
  CHECK=`echo ${ARG} | grep .*\\\.o | wc -l`
  echo "CHECK: ${CHECK}"
  if [ ${CHECK} -eq 1 ];
  then
    CFILE=`echo ${ARG} | sed s/\\\.o/\\\.c/g`
    echo "CFILE: ${CFILE}"
    CMD=`grep "bash/lib/glob/${CFILE}" ../../build.sh | sed s/\ \-c/\ \-c\ \-\-target=wasm32\ \-emit\-llvm\ \-S/g | sed s/HAVE_CONFIG_H/HAVE_CONFIG_H\ \-I\\\/home\\\/A\\\/emsdk\\\/upstream\\\/emscripten\\\/cache\\\/sysroot\\\/include\ \-I\\\/home\\\/A\\\/jebediah\\\/bash\\\/lib\\\/termcap/g | head -n1`
    echo ${CMD}
    ${CMD}
  fi
done
rm *\.o

for FILE in `ls *\.ll`
do
  llc -march=wasm32 -filetype=obj $FILE
done
popd


pushd lib/readline

rm *\.ll
for ARG in `grep "^ar" ../../build.sh | grep libreadline.a`
do
  echo "ARG: ${ARG}"
  CHECK=`echo ${ARG} | grep .*\\\.o | wc -l`
  echo "CHECK: ${CHECK}"
  if [ ${CHECK} -eq 1 ];
  then
    CFILE=`echo ${ARG} | sed s/\\\.o/\\\.c/g`
    echo "CFILE: ${CFILE}"
    CMD=`grep "bash/lib/readline/${CFILE}" ../../build.sh | sed s/\ \-c/\ \-c\ \-\-target=wasm32\ \-emit\-llvm\ \-S/g | sed s/HAVE_CONFIG_H/HAVE_CONFIG_H\ \-I\\\/home\\\/A\\\/emsdk\\\/upstream\\\/emscripten\\\/cache\\\/sysroot\\\/include\ \-I\\\/home\\\/A\\\/jebediah\\\/bash\\\/lib\\\/termcap/g | head -n1`
    echo ${CMD}
    ${CMD}
  fi
done
rm *\.o

for FILE in `ls *\.ll`
do
  llc -march=wasm32 -filetype=obj $FILE
done

rm shell.o xmalloc.o xfree.o
popd



rm *\.ll
for ARG in `grep "\-o bash" build.sh | grep -v bashversion`
do
  echo "ARG: ${ARG}"
  CHECK=`echo ${ARG} | grep .*\\\.o | wc -l`
  echo "CHECK: ${CHECK}"
  if [ ${CHECK} -eq 1 ];
  then
    CFILE=`echo ${ARG} | sed s/\\\.o/\\\.c/g`
    echo "CFILE: ${CFILE}"
    CMD=`grep "bash/${CFILE}" build.sh | grep DPROGRAM | sed s/\-c/\-c\ \-\-target=wasm32\ \-emit\-llvm\ \-S/g | sed s/HAVE_CONFIG_H/HAVE_CONFIG_H\ \-I\\\/home\\\/A\\\/emsdk\\\/upstream\\\/emscripten\\\/cache\\\/sysroot\\\/include/g | head -n1`
    echo ${CMD}
    ${CMD}
  fi
done

clang -DPROGRAM='"bash.exe"' -DCONF_HOSTTYPE='"x86_64"' -DCONF_OSTYPE='"msys"' -DCONF_MACHTYPE='"x86_64-pc-msys"' -DCONF_VENDOR='"pc"' -DLOCALEDIR='"/usr/share/locale"' -DPACKAGE='"bash"' -DSHELL -DHAVE_CONFIG_H -I/home/A/emsdk/upstream/emscripten/cache/sysroot/include -I. -I../bash -I../bash/include -I../bash/lib -Wno-parentheses -Wno-format-security -g -O2 -c --target=wasm32 -emit-llvm -S ../bash-tmp.c 

clang -DPROGRAM='"bash.exe"' -DCONF_HOSTTYPE='"x86_64"' -DCONF_OSTYPE='"msys"' -DCONF_MACHTYPE='"x86_64-pc-msys"' -DCONF_VENDOR='"pc"' -DLOCALEDIR='"/usr/share/locale"' -DPACKAGE='"bash"' -DSHELL -DHAVE_CONFIG_H -I/home/A/emsdk/upstream/emscripten/cache/sysroot/include -I. -I../bash -I../bash/include -I../bash/lib -Wno-parentheses -Wno-format-security -g -O2 -c --target=wasm32 -emit-llvm -S syntax.c 

clang -DPROGRAM='"bash.exe"' -DCONF_HOSTTYPE='"x86_64"' -DCONF_OSTYPE='"msys"' -DCONF_MACHTYPE='"x86_64-pc-msys"' -DCONF_VENDOR='"pc"' -DLOCALEDIR='"/usr/share/locale"' -DPACKAGE='"bash"' -DSHELL -DHAVE_CONFIG_H -I/home/A/emsdk/upstream/emscripten/cache/sysroot/include -I. -I../bash -I../bash/include -I../bash/lib -Wno-parentheses -Wno-format-security -g -O2 -c --target=wasm32 -emit-llvm -S builtins/builtins.c

rm *\.o

for FILE in `ls *\.ll`
do
  llc -march=wasm32 -filetype=obj $FILE
done



/home/A/emsdk/upstream/bin/wasm-ld.exe --no-entry --import-undefined --export-all -o ${PROG}-temp.wasm `ls *\.o` `ls lib/readline/*\.o` `ls lib/sh/*\.o` `ls lib/glob/*\.o` `ls builtins/*\.o`

/home/A/wabt/bin/wasm2wat.exe ${PROG}-temp.wasm > ${PROG}.wat
/home/A/wabt/bin/wat2wasm.exe ${PROG}.wat

# No asyncify needed.  Wasm3 is already asyncified
#/home/A/binaryen/build/bin/wasm-opt.exe -O1 --asyncify rogue.wasm -o rogue-asyncify.wasm
