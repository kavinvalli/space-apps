import {
  Viewer,
  Entity,
  ModelGraphics,
  CesiumComponentRef,
  GeoJsonDataSource,
  PathGraphics,
} from 'resium';
import {
  PolylineGlowMaterialProperty,
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
  SampledPositionProperty,
  ClockRange,
} from 'cesium';
import * as mod from '../../wasm/pkg';
import * as satellite from 'satellite.js';
import { useLocation } from './geolocation';
import { useEffect, useState, useRef, Ref, RefObject } from 'react';

import { ArcGisMapServerImageryProvider } from 'cesium';
import { ImageryLayer } from 'resium';
import { StreetView } from './street-view';
import { streetViewService } from './street-view-service';
// import {} from "./overhead-pass";
import Timeline from './Timeline';
import introJs from 'intro.js';
// import issModel from "../public/iss.glb";

// const ISS_TLE = `1 25544U 98067A   22273.72802950  .00014755  00000+0  26205-3 0  9998
// 2 25544  51.6446 173.6890 0002611 316.4566  76.5686 15.50428186361551`;

const ISS_TLE = `1 25544U 98067A   22274.19759479  .00014979  00000-0  26577-3 0  9998
2 25544  51.6446 171.3620 0002537 314.8685 180.8010 15.50443271361628`;

declare global {
  interface Window {
    google: any;
    S: any;
  }
}

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
  if (typeof positionAndVelocity.position === 'boolean') return;

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
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyNDBiYTUyNC1kZjI5LTRiNDQtYTZmZi0xZGM1OTE3Y2ZiYTQiLCJpZCI6MTA5ODE5LCJpYXQiOjE2NjQ1OTQ4Njd9.6EaeFnjcD1xLCaqi8MdlinlBrGzZLu2Wfl4LJvgnZtg';

interface Pos {
  longitude: number;
  latitude: number;
  height: number;
}

const imageryProvider = new UrlTemplateImageryProvider({
  url: 'third-party/OpenMapTiles-Satellite/{z}/{x}/{y}.jpg',
  maximumLevel: 5,
  credit: new Credit(
    '<span style=vertical-align:sub>© MapTiler © OpenStreetMap contributors</span>',
    true
  ),
});

export default function App() {
  const containerRef = useRef(null);
  const location = useLocation();
  const [panoData, setPanoData] = useState(null);
  const [streetViewOpen, setStreetViewOpen] = useState(true);
  const [position, setPosition] = useState<SampledPositionProperty>();
  const viewerRef = useRef<CesiumComponentRef<ViewerBase>>(null);
  const issRef = useRef<CesiumComponentRef<EntityBase>>(null);
  const [start, setStart] = useState<JulianDate>();
  const [stop, setStop] = useState<JulianDate>();
  const [year, setYear] = useState<number>(2022);

  useEffect(() => {
    if (viewerRef.current?.cesiumElement) {
      viewerRef.current.cesiumElement.scene.globe.enableLighting = true;
    }
  }, []);

  useEffect(() => {
    const tles = ISS_TLE.split('\n').map(line => line.trim());
    const satrec = satellite.twoline2satrec(tles[0], tles[1]);
    // let date = JulianDate.toDate;
    // let date = new Date();
    // const newPos = calcPos(satrec, date)!;

    const totalSeconds = 60 * 60 * 6;
    const timestepInSeconds = 10;

    const start = JulianDate.fromDate(new Date());
    const stop = JulianDate.addSeconds(start, totalSeconds, new JulianDate());

    const positionsOverTime = new SampledPositionProperty();
    if (viewerRef.current?.cesiumElement) {
      console.log('executing stuff');
      viewerRef.current.cesiumElement.clock.startTime = start.clone();
      viewerRef.current.cesiumElement.clock.stopTime = stop.clone();
      viewerRef.current.cesiumElement.clock.currentTime = start.clone();
      viewerRef.current.cesiumElement.timeline.zoomTo(start, stop);
      viewerRef.current.cesiumElement.clock.multiplier = 40;
      viewerRef.current.cesiumElement.clock.clockRange = ClockRange.LOOP_STOP;
      viewerRef.current.cesiumElement.clock.tick();
    }

    for (let i = 0; i < totalSeconds; i += timestepInSeconds) {
      const time = JulianDate.addSeconds(start, i, new JulianDate());
      const jsDate = JulianDate.toDate(time);
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
      if (typeof positionAndVelocity.position === 'boolean') return;
      const p = mod.eci_to_geodetic(
        new (mod.EciVec as any)(
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

      positionsOverTime.addSample(time, positionn);
    }
    setPosition(positionsOverTime);

    const pos = positionsOverTime.getValue(JulianDate.fromDate(new Date()));
    viewerRef.current?.cesiumElement?.camera.flyTo({
      destination: new Cartesian3(pos!.x, pos!.y, pos!.z * 2000)!,
    });
  }, []);

  useEffect(() => {
    if (!location) return;

    streetViewService.getPanorama(
      {
        location: {
          lat: location?.latitude,
          lng: location?.longitude,
        },
        preference: google.maps.StreetViewPreference.NEAREST,
        radius: 1500,
        source: google.maps.StreetViewSource.OUTDOOR,
      },
      (data, status) => setPanoData(data)
    );
  }, [location]);

  useEffect(() => {
    const interval = setInterval(() => {
      const node = document.querySelector('.cesium-animation-buttonPath');
      if (node) {
        node.dispatchEvent(new Event('click'));
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const node = document.querySelector('.cesium-animation-shuttleRingBack');
      if (node) {
        node.setAttribute(
          'data-intro',
          'Update the speed with which you view the trajectory of the ISS'
        );
        node.setAttribute('data-title', 'Speedometer');
        node.setAttribute('data-step', '4');
        node.setAttribute('data-position', 'top');

        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-intro="3d Viewer"
      data-title="Hello"
      data-step="1"
    >
      <button
        style={{
          padding: '12px 8px',
          backgroundColor: '#F2BF40',
          color: '#efefef',
          fontSize: '20px',
          border: 0,
          position: 'absolute',
          right: 0,
          bottom: 0,
          zIndex: '1000',
        }}
        onClick={() => introJs().start()}
        // onClick={() => setView(view === 'minimized' ? 'full' : 'minimized')}
      >
        Show Tutorial
      </button>
      {streetViewOpen && (
        <StreetView
          containerRef={containerRef}
          viewer={viewerRef}
          panoData={panoData}
          location={location}
          start={start}
        />
      )}
      <Viewer
        full
        ref={viewerRef}
        style={{ position: 'relative', height: '100vh' }}
      >
        {location && (
          <GeoJsonDataSource
            data={{
              type: 'Feature',
              geometry: {
                type: '',
                coordinates: [location?.longitude, location?.latitude],
              },
            }}
            onLoad={dataSource => {
              dataSource.entities.values.forEach(e => {
                // @ts-ignore
                e.billboard = null;
                // @ts-ignore
                e.point = { color: Color.RED, pixelSize: 10 };
              });
            }}
          />
        )}
        {position && year && (
          <ISS position={position} issRef={issRef} year={year} />
        )}
      </Viewer>
      <Timeline
        callback={num => {
          console.log(num);
          setYear(num);
        }}
      />
    </div>
  );
}

function ISS({
  position,
  issRef,
  year,
}: {
  position: SampledPositionProperty;
  issRef: RefObject<any>;
  year: number;
}) {
  const [show, setShow] = useState(false);
  const [iss, setIss] = useState({
    uri: '/iss.glb',
    minimumPixelSize: 3400,
    maximumScale: 8000,
  });

  useEffect(() => {
    setIss(
      year >= 1984 && year < 1997
        ? {
            uri: '/zaryafinal.gltf',
            minimumPixelSize: 1700,
            maximumScale: 80000,
          }
        : year >= 1997 && year < 2002
        ? // ? {
          //     uri: "/ISS_2016_PHASE1.glb",
          //     minimumPixelSize: 5000,
          //     maximumScale: 80000,
          //   }
          {
            uri: '/zaryafinal.gltf',
            minimumPixelSize: 1700,
            maximumScale: 80000,
          }
        : year >= 2002 && year < 2007
        ? // ? {
          //     uri: "/ISS_2016_PHASE2.gltf",
          //     minimumPixelSize: 5000,
          //     maximumScale: 8000,
          //   }
          {
            uri: '/iss.glb',
            minimumPixelSize: 3400,
            maximumScale: 8000,
          }
        : {
            uri: '/iss.glb',
            minimumPixelSize: 3400,
            maximumScale: 8000,
          }
    );
  }, [year]);

  return (
    <>
      {show && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '15px',
            position: 'absolute',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                fontFamily: 'monospace',
              }}
            >
              <span>{new Date().toDateString()}</span>
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: '24px' }}>
              ISS {'('}Zarya{')'}
            </span>
            <div style={{ fontFamily: 'monospace', fontSize: '20px' }}>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aut
              voluptatum sit veniam quo accusantium expedita, nisi nulla
              quisquam minima aliquid.
            </div>
          </div>
        </div>
      )}

      <Entity
        name="iss"
        onClick={e => {
          e.position;
          setShow(true);
          console.log(e);
        }}
        ref={issRef}
        position={position}
        model={iss}
        path={{
          leadTime: 1000,
          trailTime: 1500,
          width: 6,
          resolution: 1,
          material: new PolylineGlowMaterialProperty({
            glowPower: 0.1,
            color: Color.DARKGRAY,
            taperPower: 1,
          }),
        }}
        // billboard={null}
        // point={{ pixelSize: 10 }}
        // point={{
        //   pixelSize: 8,
        //   color: Color.TRANSPARENT,
        //   outlineColor: Color.YELLOW,
        //   outlineWidth: 3,
        // }}
      />
    </>
  );
}
