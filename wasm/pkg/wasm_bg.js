import * as wasm from './wasm_bg.wasm';

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = new Uint8Array();

function getUint8Memory0() {
    if (cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
/**
* @param {number} radians
* @returns {number}
*/
export function degrees_lat(radians) {
    const ret = wasm.degrees_lat(radians);
    return ret;
}

/**
* @param {number} radians
* @returns {number}
*/
export function degrees_lon(radians) {
    const ret = wasm.degrees_lon(radians);
    return ret;
}

/**
* @param {number} jdut1
* @returns {number}
*/
export function gstime(jdut1) {
    const ret = wasm.gstime(jdut1);
    return ret;
}

/**
* @param {number} year
* @param {number} mon
* @param {number} day
* @param {number} hr
* @param {number} minute
* @param {number} sec
* @param {number} msec
* @returns {number}
*/
export function jday(year, mon, day, hr, minute, sec, msec) {
    const ret = wasm.jday(year, mon, day, hr, minute, sec, msec);
    return ret;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}
/**
* @param {EciVec} eci
* @param {number} gmst
* @returns {GeodeticLocation}
*/
export function eci_to_geodetic(eci, gmst) {
    _assertClass(eci, EciVec);
    var ptr0 = eci.ptr;
    eci.ptr = 0;
    const ret = wasm.eci_to_geodetic(ptr0, gmst);
    return GeodeticLocation.__wrap(ret);
}

/**
*/
export class EciVec {

    static __wrap(ptr) {
        const obj = Object.create(EciVec.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ecivec_free(ptr);
    }
    /**
    * @returns {number}
    */
    get x() {
        const ret = wasm.__wbg_get_ecivec_x(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set x(arg0) {
        wasm.__wbg_set_ecivec_x(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get y() {
        const ret = wasm.__wbg_get_ecivec_y(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set y(arg0) {
        wasm.__wbg_set_ecivec_y(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get z() {
        const ret = wasm.__wbg_get_ecivec_z(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set z(arg0) {
        wasm.__wbg_set_ecivec_z(this.ptr, arg0);
    }
    /**
    * @param {number} x
    * @param {number} y
    * @param {number} z
    */
    constructor(x, y, z) {
        const ret = wasm.ecivec_new(x, y, z);
        return EciVec.__wrap(ret);
    }
}
/**
*/
export class GeodeticLocation {

    static __wrap(ptr) {
        const obj = Object.create(GeodeticLocation.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_geodeticlocation_free(ptr);
    }
    /**
    * @returns {number}
    */
    get longitude() {
        const ret = wasm.__wbg_get_ecivec_x(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set longitude(arg0) {
        wasm.__wbg_set_ecivec_x(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get latitude() {
        const ret = wasm.__wbg_get_ecivec_y(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set latitude(arg0) {
        wasm.__wbg_set_ecivec_y(this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get height() {
        const ret = wasm.__wbg_get_ecivec_z(this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set height(arg0) {
        wasm.__wbg_set_ecivec_z(this.ptr, arg0);
    }
}

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

