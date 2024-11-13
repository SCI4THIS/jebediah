let run = function (wasm3_stream, sysjs_constructor, exe_stream)
{
    let wasm3 = {
      exe_stream: exe_stream,
    }
    let sysjs = sysjs_constructor(wasm3);
    wasm3["sysjs"] =  sysjs;

    let inject_fxn = function(i32_1, i32_2, i32_3, i32_4) {
      console.log("inject_fxn(" + sysjs.str_c(i32_1) + "," + sysjs.str_c(i32_2) + "," + i32_3 + "," + i32_4 + ")");
      if (sysjs.str_c(i32_1) == "printf") {
        let off = sysjs.c_getlp(i32_3, 1);
        console.log("off: " + off);
        let res = sysjs.printf(i32_4 + off);
        sysjs.c_setp(i32_3, 0, res);
      }
      return 0;
    }

    let memory = new WebAssembly.Memory({ initial: 10, maximum: 64, shared: true });

    const wasm3_import = {
      js: { mem: memory },
      env: {
        js:            new WebAssembly.Table({ initial: 10, element: "anyfunc" }),
        memory:        memory,
        memoryBase:    0,

        __extenddftf2: sysjs.__extenddftf2,
        __extendsftf2: sysjs.__extendsftf2,
        __fpclassifyl: sysjs.__fpclassifyl,
        __signbitl:    sysjs.__signbitl,
        abort:         sysjs.abort,
        calloc:        sysjs.calloc,
        clock:         sysjs.clock,
        fflush:        sysjs.fflush,
        fputc:         sysjs.fputc,
        fputs:         sysjs.fputs,
        free:          sysjs.free,
        fwrite:        sysjs.fwrite,
        inject_fxn:    inject_fxn,
        malloc:        sysjs.malloc,
        memcmp:        sysjs.memcmp,
        memcpy:        sysjs.memmove,
        memmove:       sysjs.memmove,
        memset:        sysjs.memset,
        putc:          sysjs.fputc,
        realloc:       sysjs.realloc,
        strcmp:        sysjs.strcmp,
        strcpy:        sysjs.strcpy,
        strlen:        sysjs.strlen,
        strnlen:       sysjs.strnlen,
        strtod:        sysjs.strtod,
        strtoul:       sysjs.strtoul,
        strtoull:      sysjs.strtoul,
        vsnprintf:     sysjs.vsnprintf,
        printf:        sysjs.printf,
      }
    };

    WebAssembly.instantiateStreaming(wasm3_stream, wasm3_import).then(
        function(obj) {
            obj.instance.exports.memory.grow(10);
            wasm3.memory = new Uint8Array(obj.instance.exports.memory.buffer);
            wasm3.wasm   = obj;
            wasm3.exe_stream.then(
                function(obj) {
                    obj.arrayBuffer().then(
                        function(obj) {
                            wasm3.exe = new Uint8Array(obj);
                            let len = wasm3.exe.length;
                            let ptr = sysjs.malloc(len);
                            for (let i=0; i<len; i++) {
                                wasm3.memory[ptr + i] = wasm3.exe[i];
                            }
                            let import_fxn_names = wasm3.sysjs.c_argv(["printf"]);
                            let import_fxn_args  = wasm3.sysjs.c_argv(["i(**)"]);
                            let argv             = wasm3.sysjs.c_argv([ "1", "2" ]);
/* run_wasm(const char *wasm, size_t wasm_len, const char *module_name, int argc, char **argv,
 *          int import_fxn_len, char **import_fxn_names, char **import_fxn_args); */
                            let res = wasm3.wasm.instance.exports.run_wasm(ptr, len, "./hello.wasm", 2, argv, 1, import_fxn_names, import_fxn_args);
                            if (res != 0) {
                              console.log("res: " + wasm3.sysjs.str_c(res));
			    }
                        }
                    )
	        }
            )
        }
    )
    return wasm3;
}

module.exports.run        = run;
