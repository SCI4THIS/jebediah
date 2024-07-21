var memory_tail = 0;
let sysjs = function (g) {

  let memmove = function (i32_1, i32_2, i32_3) {
      let dst = i32_1;
      let src = i32_2;
      let n   = i32_3;

      if (src == dst) {
        return dst;
      }

      if (dst < src) {
        for (let i=0; i<n; i++) {
          g.memory[dst + i] = g.memory[src + i];
        }
      } else {
        for (let i=n; i-->0; ) {
          g.memory[dst + i] = g.memory[src + i];
        }
      }

      return dst;
  };

  let memset = function(i32_1, i32_2, i32_3) {
      let dst = i32_1;
      let val = i32_2;
      let n   = i32_3;
      for (let i=0; i<n; i++) {
        g.memory[dst + i] = val;
      }
      return dst;
  };

  let strlen = function(i32_1) {
      let src = i32_1;
      let i   = 0;
      while (g.memory[src + i] != 0) {
        i++;
      }
      return i;
  };

  let strnlen = function(i32_1, i32_2) {
      let src = i32_1;
      let n   = i32_2;
      let i   = 0;
      while (g.memory[src + i] != 0 && i < n) {
        i++;
      }
      return i;
  };

  let fwrite = function(i32_1, i32_2, i32_3, i32_4) {
    let ptr   = i32_1;
    let size  = i32_2;
    let nmemb = i32_3;
    let FILE  = i32_4;
    let i     = 0; /* number of members (bytes if size=1) written */
    console.log("fwrite(" + i32_1 + "," + i32_2 + "," + i32_3 + "," + i32_4 + ")");
    return i;
  };

  let vsnprintf = function(i32_1, i32_2, i32_3, i32_4) {
    let str    = i32_1;
    let size   = i32_2;
    let format = i32_3;
    let ap     = i32_4;
    let i      = 0; /* number of characters printed. */
    console.log("vsnprintf(" + i32_1 + "," + i32_2 + "," + i32_3 + "," + i32_4 + ")");
    return i;
  };

  let fputc = function(i32_1, i32_2) {
    let c    = i32_1;
    let FILE = i32_2;
    console.log("fputc(" + i32_1 + "," + i32_2 + ")");
    return c; /* or EOF on error */
  };

  let fputs = function(i32_1, i32_2) {
    let s    = i32_1;
    let FILE = i32_2;
    let i    = 1;
    console.log("fputs(" + i32_1 + "," + i32_2 + ")");
    return i; /* return nonnegative number on success, or EOF on error. */
  };

  let strcmp = function(i32_1, i32_2) {
    let s1  = i32_1;
    let s2  = i32_2;
    let i   = 0;
    while (g.memory[s1 + i] != 0 && g.memory[s1 + i] == g.memory[s2 + i]) {
      i++;
    }
    return g.memory[s1 + i] - g.memory[s2 + i]; /* 0 = s1/s2 equal; <0 = s1 < s2; >0 s1 > s2 */
  };

  let fflush = function(i32_1) {
    let FILE = i32_1;
    console.log("fflush(" + i32_1 + ")");
    return 0; /* Upon successful completion 0 is returned. Otherwise EOF and errno is set */
  };

  let free = function(i32_1) {
    let ptr = i32_1;
    console.log("free(" + i32_1 + ")");
    return;
  };

  let malloc = function(i32_1) {
    let size = i32_1;
    if (memory_tail == 0) {
      memory_tail = g.memory.length;
    }
    memory_tail = memory_tail - i32_1;
    console.log("malloc(" + i32_1 + ") -> " + memory_tail);
    return memory_tail;
  };

  let calloc = function(i32_1, i32_2) {
    let n = i32_1 * i32_2;
    let p = malloc(n);
    for (let i=0; i<n; i++) {
      g.memory[p + i] = 0;
    }
    return p;
  };

  let realloc = function(i32_1, i32_2) {
    let ptr     = i32_1;
    let size    = i32_2;
    let ptr_new = malloc(size);
    let n       = size; /* should be original allocated sizeo of ptr */
    for (let i=0; i<n; i++) {
      if (ptr + i > g.memory.length) {
        break;
      }
      g.memory[ptr_new + i] = g.memory[ptr + i];
    }
    free(ptr);
    return ptr_new;
  };

  let memcmp = function(i32_1, i32_2, i32_3) {
    let p1  = i32_1;
    let p2  = i32_2;
    let n   = i32_3;
    let i   = 0;
    while (i < n && g.memory[p1 + i] == g.memory[p2 + i]) {
      i++;
    }
    return g.memory[p1 + i] - g.memory[p2 + i]; /* 0 = s1/s2 equal; <0 = s1 < s2; >0 s1 > s2 */
  };

  let strtoul = function(i32_1, i32_2, i32_3) {
    let s    = i32_1;
    let e    = i32_2;
    let base = i32_3;
    let n    = 0;
    console.log("strtoul(" + i32_1 + "," + i32_2 + "," + i32_3 + ")");
    return n;
	  /*
    let i    = 0;
    let neg  = 0;
    let c;
    let c_next;

    do {
      c = g.memory[s + i];
      i++;
    } while (ISSPACE(c));

    if (c == '-') {
      neg = 1;
      c = g.memory[s + i];
      i++;
    } else if (c == '+') {
      c = g.memory[s + i];
      i++;
    }

    c_next = g.memory[s + i];
    if ((base == 0 || base == 16) && c == '0' && (c_next == 'x' || c_next == 'X')) {
      i++;
      c = g.memory[s + i];
      i++;
      base = 16;
    }

    if (base == 0) {
      if (c == '0') {
        base = 8;
      } else {
        base = 10;
      }
    }

    let cutoff = ULONG_MAX / base;
    let cutlim = ULONG_MAX % base;
    let acc;
    let any;
    for (acc=0, any=0;;) {
      c = g.memory[s + i];
      i++;
    }
    */
  };

  let strtod = function(i32_1, i32_2) {
    let s = i32_1;
    let e = i32_2;
    let n = 0;
    console.log("strtod(" + i32_1 + "," + i32_2 + ")");
    /* AFTER *e = s */
    return n;
  };

  let clock = function() {
    return Date.now();
  };

  let abort = function() {
    console.log("abort()");
  };

  let __extendsftf2 = function(i32_1, f32_1) {
    /* conversion: long double __extendsftf2(float a) */
    console.log("__extendsftf2(" + i32_1 + "," + f32_1 + ")");
    return i32_1;
  };

  let __fpclassifyl = function(i64_1, i64_2) {
    console.log("__fpclassifyl(" + i64_1 + "," + i64_2 + ")");
/* FP_NAN, FP_INFINITE, FP_ZERO, FP_SUBNORMAL, FP_NORMAL */
    return 0; /* result i32 */
  };

  let __signbitl = function(i64_1, i64_2) {
    /* __signbitl has the same spcification as signbit, except __signbitl argument type is long double */
    console.log("__signbitl(" + i64_1 + "," + i64_2 + ")");
    return 0; /* result i32 */
  };

  let __extenddftf2 = function(i32_1, f64_1) {
    /* conversion: long double __extenddftf2(double a) */
    console.log("__extenddftf2(" + i32_1 + "," + f64_1 + ")");
  };


  return {
      __extenddftf2: __extenddftf2,
      __extendsftf2: __extendsftf2,
      __fpclassifyl: __fpclassifyl,
      __signbitl:    __signbitl,
      abort:         abort,
      calloc:        calloc,
      clock:         clock,
      fflush:        fflush,
      fputc:         fputc,
      fputs:         fputs,
      free:          free,
      fwrite:        fwrite,
      malloc:        malloc,
      memcmp:        memcmp,
      memcpy:        memmove,
      memmove:       memmove,
      memset:        memset,
      putc:          fputc,
      realloc:       realloc,
      strcmp:        strcmp,
      strlen:        strlen,
      strnlen:       strnlen,
      strtod:        strtod,
      strtoul:       strtoul,
      strtoull:      strtoul,
      vsnprintf:     vsnprintf,
  };
}

module.exports.sysjs       = sysjs;
module.exports.memory_tail = memory_tail;



