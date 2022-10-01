use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add(x: i32, y: i32) -> i32 {
    x + y
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn works() {
        assert_eq!(add(1,2), 3)
    }
}