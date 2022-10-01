import {
  Viewer,
  Entity,
  ModelGraphics,
  CesiumComponentRef,
  GeoJsonDataSource,
} from "resium";
import {
  Cartesian3,
  Ion,
  Entity as EntityBase,
  Viewer as ViewerBase,
  PositionProperty,
  Color,
  JulianDate,
  Model,
  buildModuleUrl,
  UrlTemplateImageryProvider,
  TileMapServiceImageryProvider,
  Credit,
} from "cesium";
import * as mod from "../../wasm/pkg";
import * as satellite from "satellite.js";
import { useLocation } from "./geolocation";
import { useEffect, useState, useRef, Ref, RefObject } from "react";

import { ArcGisMapServerImageryProvider } from "cesium";
import { ImageryLayer } from "resium";
// import issModel from "../public/iss.glb";

// const ISS_TLE = `1 25544U 98067A   22273.72802950  .00014755  00000+0  26205-3 0  9998
// 2 25544  51.6446 173.6890 0002611 316.4566  76.5686 15.50428186361551`;

const ISS_TLE = `1 25544U 98067A   22274.19759479  .00014979  00000-0  26577-3 0  9998
2 25544  51.6446 171.3620 0002537 314.8685 180.8010 15.50443271361628`;

const calcPos = (satrec: satellite.SatRec, date = new Date()) => {
  const positionAndVelocity = satellite.propagate(satrec, date);
  const gmst = mod.gstime(
    mod.jday(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    )
  );
  if (typeof positionAndVelocity.position === "boolean") return;

  // const positionEcf = satellite.eciToEcf(positionAndVelocity.position, gmst);
  const position = mod.eci_to_geodetic(
    new (mod.EciVec as any)(
      positionAndVelocity.position.x,
      positionAndVelocity.position.y,
      positionAndVelocity.position.z
    ),
    gmst
  );

  return position;
};

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyNDBiYTUyNC1kZjI5LTRiNDQtYTZmZi0xZGM1OTE3Y2ZiYTQiLCJpZCI6MTA5ODE5LCJpYXQiOjE2NjQ1OTQ4Njd9.6EaeFnjcD1xLCaqi8MdlinlBrGzZLu2Wfl4LJvgnZtg";

interface Pos {
  longitude: number;
  latitude: number;
  height: number;
}

const imageryProvider = new UrlTemplateImageryProvider({
  url: "third-party/OpenMapTiles-Satellite/{z}/{x}/{y}.jpg",
  maximumLevel: 5,
  credit: new Credit(
    "<span style=vertical-align:sub>© MapTiler © OpenStreetMap contributors</span>",
    true
  ),
});

export default function App() {
  const location = useLocation();
  const [position, setPosition] = useState<Pos>();
  const positionCartesian =
    position &&
    Cartesian3.fromDegrees(
      position?.longitude,
      position?.latitude,
      position.height * 150000
    );
  const viewerRef = useRef<CesiumComponentRef<ViewerBase>>(null);
  const issRef = useRef<CesiumComponentRef<EntityBase>>(null);

  useEffect(() => {
    if (viewerRef.current?.cesiumElement) {
      viewerRef.current.cesiumElement.scene.globe.enableLighting = true;
      viewerRef.current.cesiumElement.shadows = true;
      // viewerRef.current.cesiumElement.imageryProvider = imageryProvider;
    }
  }, []);

  useEffect(() => {
    const tles = ISS_TLE.split("\n").map((line) => line.trim());
    const satrec = satellite.twoline2satrec(tles[0], tles[1]);
    // let date = JulianDate.toDate;
    let date = new Date();
    const newPos = calcPos(satrec, date)!;

    const position = {
      height: newPos.height,
      latitude: mod.degrees_lat(newPos.latitude),
      longitude: mod.degrees_lon(newPos.longitude),
    };

    if (viewerRef.current?.cesiumElement) {
      if (positionCartesian) {
        console.log(positionCartesian);
        viewerRef.current.cesiumElement.camera.flyTo({
          destination: positionCartesian,
        });
      }
    }
    setPosition(position);

    function updateISSPointer() {
      // setTimeout(() => {
      if (issRef.current?.cesiumElement?.position) {
        const position = calcPos(satrec, new Date())!;
        issRef.current.cesiumElement.position = Cartesian3.fromDegrees(
          mod.degrees_lon(position.longitude),
          mod.degrees_lat(position.latitude),
          position.height * 10000
        ) as any;
      }

      requestAnimationFrame(updateISSPointer);
      // }, 1000);
    }

    requestAnimationFrame(updateISSPointer);
  }, []);

  return (
    <Viewer full ref={viewerRef}>
      {/* <ImageryLayer
        imageryProvider={
          new ArcGisMapServerImageryProvider({
            url: "//services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
          })
        }
      /> */}
      {location && (
        <GeoJsonDataSource
          data={{
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [location?.longitude, location?.latitude],
            },
          }}
          onLoad={(dataSource) => {
            dataSource.entities.values.forEach((e) => {
              // @ts-ignore
              e.billboard = null;
              // @ts-ignore
              e.point = { color: Color.YELLOW, pixelSize: 10 };
            });
          }}
        />
      )}
      {position && <ISS position={position} issRef={issRef} />}
    </Viewer>
  );
}

function ISS({ position, issRef }: { position: Pos; issRef: RefObject<any> }) {
  return (
    <Entity
      name="iss"
      ref={issRef}
      position={Cartesian3.fromDegrees(
        position?.longitude,
        position?.latitude,
        position.height * 1000
      )}
      model={{
        uri: "/iss.glb",
        // scale: 100,
        minimumPixelSize: 256,
        maximumScale: 5000,
      }}
      // point={{ pixelSize: 10 }}
    >
      test
    </Entity>
  );
}
