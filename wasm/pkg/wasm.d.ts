/* tslint:disable */
/* eslint-disable */
/**
* @param {number} radians
* @returns {number}
*/
export function degrees_lat(radians: number): number;
/**
* @param {number} radians
* @returns {number}
*/
export function degrees_lon(radians: number): number;
/**
* @param {number} jdut1
* @returns {number}
*/
export function gstime(jdut1: number): number;
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
export function jday(year: number, mon: number, day: number, hr: number, minute: number, sec: number, msec: number): number;
/**
* @param {EciVec} eci
* @param {number} gmst
* @returns {GeodeticLocation}
*/
export function eci_to_geodetic(eci: EciVec, gmst: number): GeodeticLocation;
/**
*/
export class EciVec {
  free(): void;
/**
* @param {number} x
* @param {number} y
* @param {number} z
*/
  constructor(x: number, y: number, z: number);
/**
*/
  x: number;
/**
*/
  y: number;
/**
*/
  z: number;
}
/**
*/
export class GeodeticLocation {
  free(): void;
/**
*/
  height: number;
/**
*/
  latitude: number;
/**
*/
  longitude: number;
}
