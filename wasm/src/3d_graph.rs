use crate::isolate_state::IsolateState;
use crate::js_loading;
use crate::transformer;
use std::collections::HashMap;
use std::path::Path;
use v8;

pub struct ModuleMap {
    hash_to_absolute_path: HashMap<i32, String>,
    absolute_path_to_module: HashMap<String, v8::Global<v8::Module>>,
}

impl ModuleMap {
    pub fn new() -> Self {
        Self {
            hash_to_absolute_path: HashMap::new(),
            absolute_path_to_module: HashMap::new(),
        }
    }

    fn insert(
        &mut self,
        scope: &mut v8::HandleScope,
        filepath: &str,
        module: v8::Local<v8::Module>,
    ) {
        self.hash_to_absolute_path
            .insert(module.get_identity_hash(), filepath.to_owned());
        let module = v8::Global::new(scope, module);
        self.absolute_path_to_module
            .insert(filepath.to_owned(), module);
    }
}

pub struct Loader {}

impl Loader {
    pub fn new() -> Self {
        Self {}
    }

    pub fn import<'a>(
        &self,
        scope: &mut v8::HandleScope<'a>,
        referrer: &str,
        specifier: &str,
    ) -> Result<v8::Local<'a, v8::Value>, v8::Local<'a, v8::Value>> {
        let scope = &mut v8::TryCatch::new(scope);

        match resolve(scope, referrer, specifier) {
            Some(module) => {
                module
                    .instantiate_module(scope, module_resolve_callback)
                    .unwrap();

                let res = module.evaluate(scope).unwrap();
                let promise = unsafe { v8::Local::<v8::Promise>::cast(res) };
                match promise.state() {
                    v8::PromiseState::Fulfilled => Ok(promise.result(scope)),
                    v8::PromiseState::Rejected => Err(promise.result(scope)),
                    v8::PromiseState::Pending => panic!("Pending Promise"),
                }
            }
            None => Err(scope.stack_trace().unwrap()),
        }
    }
}

fn module_resolve_callback<'a>(
    context: v8::Local<'a, v8::Context>,
    specifier: v8::Local<'a, v8::String>,
    _import_assertions: v8::Local<'a, v8::FixedArray>,
    referrer: v8::Local<'a, v8::Module>,
) -> Option<v8::Local<'a, v8::Module>> {
    let scope = unsafe { &mut v8::CallbackScope::new(context) };

    let hash = referrer.get_identity_hash();

    let state = IsolateState::get(scope);
    let referrer_path = state
        .borrow()
        .module_map
        .hash_to_absolute_path
        .get(&hash)
        .unwrap()
        .to_owned();

    let requested_rel_path = specifier.to_rust_string_lossy(scope);
    resolve(scope, &referrer_path, &requested_rel_path)
}

fn resolve<'a>(
    scope: &mut v8::HandleScope<'a>,
    referrer: &str,
    specifier: &str,
) -> Option<v8::Local<'a, v8::Module>> {
    let state = IsolateState::get(scope);

    let requested_abs_path = normalize_path(referrer, specifier);
    if let Some(module) = state
        .borrow()
        .module_map
        .absolute_path_to_module
        .get(&requested_abs_path)
    {
        return Some(v8::Local::new(scope, module));
    }

    let requested_string = v8::String::new(scope, &requested_abs_path).unwrap();
    let origin = js_loading::create_script_origin(scope, requested_string, true);
    let src = std::fs::read_to_string(&requested_abs_path)
        .expect("Something went wrong with reading the file");
    let js_src = transformer::transform(requested_abs_path.clone(), src).code;
    let code = v8::String::new(scope, &js_src).unwrap();
    let source = v8::script_compiler::Source::new(code, Some(&origin));

    let module = v8::script_compiler::compile_module(scope, source);
    if let Some(module) = module {
        let state = IsolateState::get(scope);

        state
            .borrow_mut()
            .module_map
            .insert(scope, &requested_abs_path, module);
    }

    module
}

fn normalize_path(referrer_path: &str, requested: &str) -> String {
    let req_path = Path::new(requested);
    if req_path.is_absolute() {
        return requested.to_string();
    }
    let ref_dir = Path::new(referrer_path).parent().unwrap();
    let normalized = ref_dir.join(req_path).canonicalize();
    normalized.unwrap().to_string_lossy().into()
}