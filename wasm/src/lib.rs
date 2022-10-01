use wasm_bindgen::prelude::*;

const PI: f32 = std::f32::consts::PI;

#[wasm_bindgen]
pub fn degrees_lat(radians: f32) -> f32 {
    if radians < (-PI / 2.0) || radians > (PI / 2.0) {
        panic!("radians must be between -PI/2 and PI/2");
    }

    radians * 180.0 / PI
}

#[wasm_bindgen]
pub fn degrees_lon(radians: f32) -> f32 {
    if radians < (-PI) || radians > PI {
        panic!("radians must be between -PI and PI");
    }

    radians * 180.0 / PI
}

const TWO_PI: f32 = std::f32::consts::PI * 2.0;
const DEG_2_RAD: f32 = PI / 180.0;

#[wasm_bindgen]
pub fn gstime(jdut1: f32) -> f32 {
    let tut1 = (jdut1 - 2451545.0) / 36525.0;

    let mut temp = (-6.2e-6 * tut1 * tut1 * tut1)
        + (0.093104 * tut1 * tut1)
        + (((876600.0 * 3600.0) + 8640184.812866) * tut1)
        + 67310.54841; // # sec
    temp = ((temp * DEG_2_RAD) / 240.0) % TWO_PI; // 360/86400 = 1/240, to deg, to rad

    //  ------------------------ check quadrants ---------------------
    if temp < 0.0 {
        temp += TWO_PI;
    }

    return temp;
}

#[wasm_bindgen]
pub fn jday(year: f32, mon: f32, day: f32, hr: f32, minute: f32, sec: f32, msec: f32) -> f32 {
    ((367.0 * year) - f32::floor((7.0 * (year + f32::floor((mon + 9.0) / 12.0))) * 0.25))
        + f32::floor((275.0 * mon) / 9.0)
        + day
        + 1721013.5
        + (((((msec / 60000.0) + (sec / 60.0) + minute) / 60.0) + hr) / 24.0)
}

#[wasm_bindgen]
pub struct EciVec {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[wasm_bindgen]
impl EciVec {
    #[wasm_bindgen(constructor)]
    pub fn new(x: f32, y: f32, z: f32) -> EciVec {
        EciVec { x, y, z }
    }
}

#[wasm_bindgen]
pub struct GeodeticLocation {
    pub longitude: f32,
    pub latitude: f32,
    pub height: f32,
}

#[wasm_bindgen]
pub fn eci_to_geodetic(eci: EciVec, gmst: f32) -> GeodeticLocation {
    // http://www.celestrak.com/columns/v02n03/
    let a = 6378.137;
    let b = 6356.7523142;
    let r = f32::sqrt((eci.x * eci.x) + (eci.y * eci.y));
    let f = (a - b) / a;
    let e2 = (2.0 * f) - (f * f);

    let mut longitude = eci.y.atan2(eci.x) - gmst;
    while longitude < (-PI) {
        longitude += TWO_PI;
    }
    while longitude > PI {
        longitude -= TWO_PI;
    }

    let kmax = 20;
    let mut k = 0;
    let mut latitude = eci.z.atan2(f32::sqrt((eci.x * eci.x) + (eci.y * eci.y)));
    // init value might differ
    let mut c = 0.0;
    while k < kmax {
        c = 1.0 / f32::sqrt(1.0 - (e2 * (f32::sin(latitude) * f32::sin(latitude))));
        latitude = f32::atan2(eci.z + (a * c * e2 * f32::sin(latitude)), r);
        k += 1;
    }
    let height = (r / f32::cos(latitude)) - (a * c);

    GeodeticLocation {
        longitude,
        latitude,
        height,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn gstime_bench() {
        let now = std::time::Instant::now();
        let res = gstime(jday(2022.0, 10.0, 1.0, 18.0, 40.0, 11.0, 355.0));
        println!("{}, {}ns", res, now.elapsed().as_nanos());
    }
}
