var memory_tail = 0;
let sysjs = function (g) {

let s_printf_d = function(modifier, data, output_type)
{
  let left_align = false;
  let zero_pad = false;
  let i = 0;
  let data_orig = data;
  if (modifier[i] == '-') {
    left_align = true;
    i++;
  }
  if (modifier[i] == '0') {
    zero_pad = true;
    i++;
  }
  let width = 0;
  if (i >= modifier.length) {
  } else if (modifier[i] == '*') {
    width = (1 << 24) * g.memory[data + 3] +
            (1 << 16) * g.memory[data + 2] +
            (1 <<  8) * g.memory[data + 1] +
            (1 <<  0) * g.memory[data + 0];
    data += 4;
  } else if ('1' <= modifier[i] && modifier[i] <= '9') {
    width = Number(modifier.substr(i));
  } else {
    console.error("Unhandled modifier: " + modifier);
  }

  let n = (1 << 24) * g.memory[data + 3] +
          (1 << 16) * g.memory[data + 2] +
          (1 <<  8) * g.memory[data + 1] +
          (1 <<  0) * g.memory[data + 0];
  data += 4;

  let s;
  if (output_type == 'd') {
    s = n.toString(10);
  } else if (output_type == 'x') {
    s = n.toString(16);
  } else if (output_type == 'X') {
    s = n.toString(16).toUpperCase();
  }
  if (width != 0) {
    let adjust = width - s.length;
    for (let i=0; i<adjust; i++) {
      if (left_align) {
        s = s + " ";
      } else if (zero_pad) {
        s = "0" + s;
      } else {
        s = " " + s;
      }
    }
  }

  return { s: s, n: data - data_orig };
}

let s_from_printf = function(i32_1, i32_2, i32_3)
{
  let fmt = i32_1;
  let data = i32_2;
  let n = i32_3;
  if (n == undefined) {
    n = 0;
  }
  let s = "";
  let i = 0;
  let modifier = "";
  while (g.memory[fmt + i] != 0) {
    let c = String.fromCharCode(g.memory[fmt + i]);
    if (c != '%') {
      s += String.fromCharCode(g.memory[fmt + i]);
      i++;
      if (n > 0 && i >= n) { return s; }
      modifier = "";
      continue;
    }
    let is_modifier = false;
    i++;
    if (n > 0 && i >= n) { return s; }
    do {
      c = String.fromCharCode(g.memory[fmt + i]);
      is_modifier = false;
      switch (c) {
        case '%': s += "%"; break;
        case '-':
        case '*':
        case ' ':
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9':
          modifier += c;
          is_modifier = true;
          break;
        case 'd':
        case 'x':
        case 'X':
          res = s_printf_d(modifier, data, c);
          data += res.n;
          s += res.s;
          break;
        case 'p':
          res = s_printf_d("08X", data, 'X');
          data += res.n;
          s += "0x" + res.s;
          break;
        case 'c':
          let cc = (1 << 24) * g.memory[data + 3] +
                   (1 << 16) * g.memory[data + 2] +
                   (1 <<  8) * g.memory[data + 1] +
                   (1 <<  0) * g.memory[data + 0];
          data += 4;
          s += String.fromCharCode(cc);
          break;
        case 's':
          let s_n = (1 << 24) * g.memory[data + 3] +
                    (1 << 16) * g.memory[data + 2] +
                    (1 <<  8) * g.memory[data + 1] +
                    (1 <<  0) * g.memory[data + 0];
          data += 4;
          let s_c = g.memory[s_n];
          while (s_c != 0) {
            s += String.fromCharCode(s_c);
            s_n++;
            s_c = g.memory[s_n];
          }
          break;
        default:
          s += "%" + modifier + c;
          break;
      }
      i++;
      if (n > 0 && i >= n) { return s; }
    } while (is_modifier);
  }
  return s;
}


  let strcpy = function (i32_1, i32_2) {
    let dst = i32_1;
    let src = i32_2;
    let i   = 0;
    console.log("strcpy(" + i32_1 + "," + i32_2 + ")");
    while (g.memory[src + i] != 0) {
      g.memory[dst + i] = g.memory[src + i];
      i++;
    }
    g.memory[dst + i] = 0;
    return src + i; /* This function returns a pointer to the terminating null byte
                       of the copied string */
  };

  let strlen = function(i32_1) {
      let src = i32_1;
      let i   = 0;
      console.log("strlen(" + i32_1 + ")");
      while (g.memory[src + i] != 0) {
        i++;
      }
      return i;
  };


  let strcat = function (i32_1, i32_2, i32_3) {
    let dst     = i32_1;
    let src     = i32_2;
    let n       = i32_3;
    let dst_len = strlen(dst);
    let i   = 0;
    for (i=0; i<n && g.memory[src + i] != 0; i++) {
      g.memory[dst + dst_len + i] = g.memory[src + i];
    }
    g.memory[dst + dst_len + i] = 0;
    return dst;
  };

  let memmove = function (i32_1, i32_2, i32_3) {
      let dst = i32_1;
      let src = i32_2;
      let n   = i32_3;

      console.log("memmove(" + i32_1 + "," + i32_2 + "," + i32_3 + ")");

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
      console.log("memset(" + i32_1 + "," + i32_2 + "," + i32_3 + ")");
      for (let i=0; i<n; i++) {
        g.memory[dst + i] = val;
      }
      return dst;
  };

  let strnlen = function(i32_1, i32_2) {
      let src = i32_1;
      let n   = i32_2;
      let i   = 0;
      console.log("strnlen(" + i32_1 + "," + i32_2 + ")");
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
    let dst    = i32_1;
    let n      = i32_2;
    let format = i32_3;
    let ap     = i32_4;
    let i      = 0; /* number of characters printed. */
    console.log("vsnprintf(" + i32_1 + "," + i32_2 + "," + i32_3 + "," + i32_4 + ")");
    let s = s_from_printf(i32_3, i32_4, i32_2);
    for (i=0; i<s.length; i++) {
      g.memory[dst + i] = s.charCodeAt(i);
      i++;
    }
    if (i < i32_2) {
      g.memory[dst + i] = 0;
    }
    console.log("->" + s);
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
    console.log("strcmp(" + str_c(i32_1) + "," + str_c(i32_2) + ")");
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
    console.log("calloc(" + i32_1 + "," + i32_2 + ")");
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
    console.log("realloc(" + i32_1 + "," + i32_2 + ")");
    if (ptr == 0) {
      return ptr_new;
    }
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
    console.log("memcmp(" + i32_1 + "," + i32_2 + "," + i32_3 + ")");
    for (let i=0; i<n; i++) {
      let res = g.memory[p1 + i] - g.memory[p2 + i];
      /* 0 = s1/s2 equal; <0 = s1 < s2; >0 s1 > s2 */
      if (res != 0) { return res; }
    }
    return 0;
  };

  let str_c = function(p) {
    let s = "";
    let i = 0;
    while (g.memory[p + i] != 0) {
      s += String.fromCharCode(g.memory[p + i]);
      i++;
    }
    return s;
  }

  let c_str = function(s) {
    let data = malloc(s.length + 1);
    for (let i=0; i<s.length; i++) {
      g.memory[data + i] = s.charCodeAt(i);
    }
    g.memory[data + s.length] = 0;
    return data;
  };

  let c_getp = function(ps, i) {
    let ix = i * 4;
    let res = 0;
    for (let j=4; j-->0;) {
      res = res * 256;
      res += g.memory[ps + ix + j];
    }
    return res;
  }

  let c_getlp = function(ps, i) {
    let ix = i * 8;
    let res = 0;
    for (let j=8; j-->0;) {
      res = res * 256;
      res += g.memory[ps + ix + j];
    }
    return res;
  }

  let c_setp = function(ps, i, p) {
    let ix = i * 4;
    //for (let j=4; j-->0;) {
    for (let j=0; j<4; j++) {
      g.memory[ps + ix + j] = p % 256;
      p = p / 256;
    }
  };

  let c_argv = function(arr_s) {
    let data = malloc(4 * arr_s.length);
    for (let i=0; i<arr_s.length; i++) {
      let s = c_str(arr_s[i]);
      c_setp(data, i, s);
    }
    return data;
  };

  let snprintf = function(i32_1, i32_2, i32_3, i32_4) {
    let s = s_from_printf(i32_3, i32_4, i32_2);
    let dst = i32_1;
    let i   = 0;
    console.log("snprintf(" + i32_1 + "," + i32_2 + "," + i32_3 + "," + i32_4 + ")");
    for (i=0; i<s.length; i++) {
      g.memory[dst + i] = s.charCodeAt(i);
      i++;
    }
    if (i < i32_2) {
      g.memory[dst + i] = 0;
    }
    return i;
  }

  let sprintf = function(i32_1, i32_2, i32_3) {
    let s = s_from_printf(i32_2, i32_3)
    let dst = i32_1;
    let i   = 0;
    console.log("sprintf(" + i32_1 + "," + i32_2 + "," + i32_3 + ")");
    for (i=0; i<s.length; i++) {
      g.memory[dst + i] = s.charCodeAt(i);
      i++;
    }
    g.memory[dst + i] = 0;
    return i;
  }

  let fprintf = function(i32_1, i32_2, i32_3) {
    console.log("fprintf: (" + i32_1 + "): " + s_from_printf(i32_2, i32_3));
  }

  let printf = function(i32_1, i32_2) {
    console.log("printf: " + s_from_printf(i32_1, i32_2));
  }

  let sleep = function(i32_1) {
    console.log("sleep: " + i32_1);
  }


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
      strcpy:        strcpy,
      strlen:        strlen,
      strnlen:       strnlen,
      strtod:        strtod,
      strtoul:       strtoul,
      strtoull:      strtoul,
      vsnprintf:     vsnprintf,
      c_str:         c_str,
      c_argv:        c_argv,
      c_setp:        c_setp,
      c_getp:        c_getp,
      c_getlp:       c_getlp,
      str_c:         str_c,
      printf:        printf,
      fprintf:       fprintf,
      sleep:         sleep,
      snprintf:      snprintf,
      sprintf:       sprintf,
      strcat:        strcat,
  };
}

module.exports.sysjs       = sysjs;
module.exports.memory_tail = memory_tail;

