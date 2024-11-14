let run = function (wasm3_stream, sysjs_constructor, exe_stream)
{
    let wasm3 = {
      exe_stream: exe_stream,
      is_sleep_waiting: false,
    }
    let sysjs = sysjs_constructor(wasm3);
    wasm3["sysjs"] =  sysjs;

    let inject_fxn = function(i32_1, i32_2, i32_3, i32_4) {
      console.log("inject_fxn(" + sysjs.str_c(i32_1) + "," + sysjs.str_c(i32_2) + "," + i32_3 + "," + i32_4 + ")");
      if (sysjs.str_c(i32_1) == "printf") {
        let off = sysjs.c_getlp(i32_3, 1);
        let res = sysjs.printf(i32_4 + off);
        sysjs.c_setp(i32_3, 0, res);
      }
      if (sysjs.str_c(i32_1) == "sleep") {
        let sec = sysjs.c_getlp(i32_3, 1);
        if (!wasm3.is_sleep_waiting) {
          wasm3.wasm.instance.exports.asyncify_start_unwind();
          setTimeout(function () {
            console.log("Restart");
            wasm3.wasm.instance.exports.asyncify_start_rewind();
            let res = wasm3.wasm.instance.exports.run_wasm(wasm3.ptr, wasm3.len, "./hello.wasm", 2, wasm3.argv, wasm3.import_fxn_count, wasm3.import_fxn_names, wasm3.import_fxn_args);
            if (res != 0) {
              console.log("res: " + wasm3.sysjs.str_c(res));
	    }
            console.log("wasm3 exits to stop_unwind()");
            wasm3.wasm.instance.exports.asyncify_stop_unwind();
	  }, sec * 1000);
	} else {
          wasm3.wasm.instance.exports.asyncify_stop_rewind();
	}
        wasm3.is_sleep_waiting = !wasm3.is_sleep_waiting;
        let res = sysjs.sleep(sec);
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
        sleep:         sysjs.sleep,
        fprintf:       sysjs.fprintf,
        snprintf:      sysjs.snprintf,
        sprintf:       sysjs.sprintf,
        strcat:        sysjs.strcat,
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
                            wasm3.len = wasm3.exe.length;
                            wasm3.ptr = sysjs.malloc(wasm3.len);
                            for (let i=0; i<wasm3.len; i++) {
                                wasm3.memory[wasm3.ptr + i] = wasm3.exe[i];
                            }
                            wasm3.import_fxn_count = 2;
                            wasm3.import_fxn_names = wasm3.sysjs.c_argv(["printf", "sleep"]);
                            wasm3.import_fxn_args  = wasm3.sysjs.c_argv(["i(**)", "i(i)"]);
                            wasm3.argv             = wasm3.sysjs.c_argv([ "1", "2" ]);
/* run_wasm(const char *wasm, size_t wasm_len, const char *module_name, int argc, char **argv,
 *          int import_fxn_len, char **import_fxn_names, char **import_fxn_args); */
                            let res = wasm3.wasm.instance.exports.run_wasm(wasm3.ptr, wasm3.len, "./hello.wasm", 2, wasm3.argv, wasm3.import_fxn_count, wasm3.import_fxn_names, wasm3.import_fxn_args);
                            if (res != 0) {
                              console.log("res: " + wasm3.sysjs.str_c(res));
			    }
                            console.log("wasm3 exits to stop_unwind()");
                            wasm3.wasm.instance.exports.asyncify_stop_unwind();
                        }
                    )
	        }
            )
        }
    )
    return wasm3;
}

module.exports.run        = run;
