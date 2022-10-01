use std::sync::Arc;
use swc::config::{Config, JscConfig, Options};
use swc::ecmascript::ast::EsVersion;
use swc::{try_with_handler, Compiler, TransformOutput};
use swc_common::sync::Lazy;
use swc_common::{FileName, FilePathMapping, SourceMap};
use swc_ecma_parser::{Syntax, TsConfig};

static COMPILER: Lazy<Arc<Compiler>> = Lazy::new(|| {
    let cm = Arc::new(SourceMap::new(FilePathMapping::empty()));

    Arc::new(Compiler::new(cm.clone()))
});

fn get_compiler() -> Arc<Compiler> {
    COMPILER.clone()
}

pub fn transform(filename: String, src: String) -> TransformOutput {
    let c = get_compiler();

    try_with_handler(c.cm.clone(), true, |handler| {
        c.process_js_file(
            c.cm.new_source_file(FileName::Anon, src),
            handler,
            &Options {
                config: Config {
                    jsc: JscConfig {
                        syntax: Some(Syntax::Typescript(TsConfig {
                            decorators: true,
                            dynamic_import: true,
                            import_assertions: true,
                            tsx: true,
                            ..Default::default()
                        })),
                        target: Some(EsVersion::Es2020),
                        ..Default::default()
                    },
                    minify: false,
                    ..Default::default()
                },
                filename,
                swcrc: false,
                ..Default::default()
            },
        )
    })
    .unwrap()
}