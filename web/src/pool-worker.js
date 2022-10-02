globalThis.global = globalThis;
// @ts-check

import * as mod from "../../wasm/pkg";
import Cartesian3 from "cesium/Source/Core/Cartesian3";
import * as satellite from "satellite.js";

function calculatePosition(satrec, jsDate = new Date()) {
  const positionAndVelocity = satellite.propagate(satrec, jsDate);
  const gmst = mod.gstime(
    mod.jday(
      jsDate.getUTCFullYear(),
      jsDate.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
      jsDate.getUTCDate(),
      jsDate.getUTCHours(),
      jsDate.getUTCMinutes(),
      jsDate.getUTCSeconds(),
      jsDate.getUTCMilliseconds()
    )
  );
  if (typeof positionAndVelocity.position === "boolean") return;
  const p = mod.eci_to_geodetic(
    new mod.EciVec(
      // @ts-ignore
      positionAndVelocity.position.x,
      positionAndVelocity.position.y,
      positionAndVelocity.position.z
    ),
    gmst
  );

  const positionn = Cartesian3.fromDegrees(
    mod.degrees_lon(p.longitude),
    mod.degrees_lat(p.latitude),
    p.height * 1000
  );

  return positionn;
}

const ISS_TLE = `1 25544U 98067A   22274.19759479  .00014979  00000-0  26577-3 0  9998
2 25544  51.6446 171.3620 0002537 314.8685 180.8010 15.50443271361628`;

const tles = ISS_TLE.split("\n").map((line) => line.trim());
const satrec = satellite.twoline2satrec(tles[0], tles[1]);

addEventListener("message", () => {
  const jsDate = new Date();
  const result = [];
  for (let i = 0; i < 60 * 24; i++) {
    result.push(i);
  }
  postMessage(result);
});
