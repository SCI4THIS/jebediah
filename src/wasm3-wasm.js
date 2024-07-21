var wasm;
let load_wasm3 = function (url, sysjs_constructor)
{
    let g     = { };
    let sysjs = sysjs_constructor(g);
    const wasm3_import = {
      env: {
        js:         new WebAssembly.Table({ initial: 2, element: "anyfunc" }),
        memory:     new WebAssembly.Memory({ initial: 1, maximum: 32, shared: true }),
        memoryBase: 0,
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
        malloc:        sysjs.malloc,
        memcmp:        sysjs.memcmp,
        memcpy:        sysjs.memmove,
        memmove:       sysjs.memmove,
        memset:        sysjs.memset,
        putc:          sysjs.fputc,
        realloc:       sysjs.realloc,
        strcmp:        sysjs.strcmp,
        strlen:        sysjs.strlen,
        strnlen:       sysjs.strnlen,
        strtod:        sysjs.strtod,
        strtoul:       sysjs.strtoul,
        strtoull:      sysjs.strtoul,
        vsnprintf:     sysjs.vsnprintf,
      }
    };

    WebAssembly.instantiateStreaming(fetch(url), wasm3_import).then(
        function(obj) {
            g.memory = new Uint8Array(obj.instance.exports.memory.buffer);
            wasm     = obj;
        }
    )
}

module.exports.load_wasm3 = load_wasm3;
module.exports.wasm       = wasm;
