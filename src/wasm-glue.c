#ifndef BASE_TESTING
int stdin  = 0;
int stdout = 1;
int stderr = 2;
#endif

#include <string.h>
#include "wasm3.h"

extern const void *inject_fxn(const char *name, const char *args, uint64_t *_sp, void *_mem);

typedef struct fxn_prototype_st {
  char *name;
  char *args;
} *fxn_prototype_t;

fxn_prototype_t build_fxn_prototypes(int len, char **names, char **args)
{
  size_t           header_size = sizeof(struct fxn_prototype_st) * len;
  size_t           size        = 0;
  fxn_prototype_t  res         = NULL;
  int              i;
  char            *p;

  size += header_size;
  for (i=0; i<len; i++) {
    size += strlen(names[i]) + 1;
    size += strlen(args[i]) + 1;
  }
  p = malloc(size);
  res = (fxn_prototype_t)p;
  p += header_size;
  for (i=0; i<len; i++) {
    strcpy(p, names[i]);
    res[i].name = p;
    p += strlen(names[i]);
    *p = '\0';
    p++;

    strcpy(p, args[i]);
    res[i].args = p;
    p += strlen(args[i]);
    *p = '\0';
    p++;
  }
  return res;
}

/*m3ApiRawFunction(injector_fxn)*/
const void *injector_fxn(IM3Runtime runtime, IM3ImportContext _ctx, uint64_t *_sp, void *_mem)
{
   fxn_prototype_t  proto      = (fxn_prototype_t)_ctx->userdata;
   return inject_fxn(proto->name, proto->args, _sp, _mem);
}

M3Result run_wasm(const unsigned char *wasm, size_t wasm_len, const char *module_name, int argc, const char **argv, int import_fxn_len, char **import_fxn_names, char **import_fxn_args)
{
//  unsigned        stack      = 65536;
  unsigned        stack      = 1024;
  IM3Environment  env        = m3_NewEnvironment();
  IM3Runtime      runtime    = m3_NewRuntime(env, stack, NULL);
  IM3Module       module     = NULL;
  const char     *main_func  = "__main_argc_argv";
  fxn_prototype_t prototypes = NULL;
  IM3Function     func       = NULL;
  int             i          = 0;
  M3Result        result     = m3Err_none;

  prototypes = build_fxn_prototypes(import_fxn_len, import_fxn_names, import_fxn_args);

  result = m3_ParseModule(env, &module, wasm, wasm_len);
  if (result) { return result; }

  result = m3_LoadModule(runtime, module);
  if (result) { return result; }

  for (i=0; i<import_fxn_len; i++) {
    result = m3_LinkRawFunctionEx(module, "env", import_fxn_names[i], import_fxn_args[i], injector_fxn, &prototypes[i]);
    if (result == m3Err_functionLookupFailed) {
      /* Probably supplied an import function that the program doesn't need. */
      continue;
    }
    if (result) { return result; }
  }

  m3_SetModuleName(module, module_name);

  result = m3_CompileModule(module);
  if (result) { return result; }

  result = m3_FindFunction(&func, runtime, main_func);
  if (result) { return result; }

  result = m3_CallArgv(func, argc, argv);
  return result;
}
