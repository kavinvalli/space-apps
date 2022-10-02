import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { JulianDate } from "cesium";
import { motion, AnimatePresence } from "framer-motion";
import * as Cesium from "cesium";

export function StreetView({
  location: loc,
  start,
  panoData,
  viewer: viewerRef,
  containerRef,
}: {
  location: any;
  start: any;
  panoData: any;
  viewer: any;
  containerRef: any;
}) {
  const dockRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"minimized" | "full">("full");
  const modifyTarget = useCallback(
    (target: number) => {
      const containerRect = containerRef.current!.getBoundingClientRect();
      const dockRect = dockRef.current!.getBoundingClientRect();
      const dockMiddleX = dockRect.width / 2;
      const dockMiddleY = dockRect.height / 2;

      if (target + dockMiddleX > containerRect.width / 2) {
        return containerRect.width;
      } else if (target + dockMiddleY > containerRect.height / 2) {
        return containerRect.height;
      }

      return 0;
    },
    [containerRef]
  );
  const streetViewRef = useRef(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const pano = useMemo(() => {
    return !panoData
      ? null
      : new google.maps.StreetViewPanorama(streetViewRef.current, {
          pano: panoData.location.pano,
          disableDefaultUI: true,
          motionTracking: false,
          // scrollwheel: false,
          zoom: 1,
          clickToGo: true,
          panControl: true,
          // clickToGo: false,
        });
  }, [panoData]);

  useEffect(() => {
    if (!pano) return;

    // document.getElementById("streetView").style.display = "block";
    overlayRef.current!.style.display = "block";
    // document.getElementById("streetViewUi").style.display = "block";
    const overlayCanvas = overlayRef.current!;
    const ctx = overlayCanvas.getContext("2d")!;

    let width = (overlayCanvas.width = overlayCanvas.offsetWidth);
    let height = (overlayCanvas.height = overlayCanvas.offsetHeight);
    ctx.clearRect(0, 0, width, height);
    const tempJulianDate = new JulianDate();
    const listeners: any[] = [];

    let planetarium: any = null;

    const currentTime = JulianDate.addSeconds(
      viewerRef.current.cesiumElement.clock.startTime,
      1,
      new JulianDate()
    );
    planetarium = S.virtualsky({
      id: "virtualSky",
      projection: "gnomic",
      ground: true,
      latitude: loc.latitude,
      longitude: loc.longitude,
      clock: JulianDate.toDate(currentTime),
      scalestars: 2,
      showdate: false,
      showposition: false,
      showhelp: false,
      showplanetlabels: true,
      fov: 120,
      gridstep: 90,
      gradient: true,
      gridlines_az: true,
      keyboard: false,
      gridlineswidth: 10,
      constellations: true,
      constellationlabels: true,
    });
    planetarium.grid.az = false;
    planetarium.gradient = false;
    planetarium.transparent = true;
    planetarium.col.constellation = "rgba(180,180,255,0.4)";
    planetarium.scalestars = 1.2;
    planetarium.cardinalpoints = false;

    console.log("drawn");
    planetarium.draw();

    const onChange = () => {
      width = overlayCanvas.width = overlayCanvas.offsetWidth;
      height = overlayCanvas.height = overlayCanvas.offsetHeight;
      let lat = loc.latitude;
      let lon = loc.longitude;
      const alt = loc.altitude;
      const location = pano.getLocation();
      if (!location) return;

      const userLocation = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
      let { heading, pitch } = pano.getPov();
      planetarium.ra_off = -Cesium.Math.toRadians(heading);
      planetarium.dc_off = Cesium.Math.toRadians(pitch);
      let transform = Cesium.Transforms.eastNorthUpToFixedFrame(userLocation);
      let inverseTransform = Cesium.Matrix4.inverse(
        transform,
        new Cesium.Matrix4()
      );
      ctx.clearRect(0, 0, width, height);
      let first = true;
      const currentTime = Cesium.JulianDate.addSeconds(
        viewerRef.current.cesiumElement.clock.startTime,
        1,
        new JulianDate()
      );
      planetarium.updateClock(Cesium.JulianDate.toDate(currentTime));
      // for (let transit of selectedTransitGroup.transits) {
      //   let satIndex = transit.sat;
      //   if (
      //     Cesium.JulianDate.compare(currentTime, transit.start) < 0 ||
      //     Cesium.JulianDate.compare(currentTime, transit.end) > 0
      //   ) {
      //     continue;
      //   }
      //   let satPosition = positionProperties[satIndex].getValue(currentTime);
      let local = Cesium.Matrix4.multiplyByPoint(
        inverseTransform,
        new Cesium.Cartesian3(),
        new Cesium.Cartesian3()
      );
      let xy = local.clone();
      xy.z = 0;
      pitch = Cesium.Cartesian3.angleBetween(xy, local);
      heading = Math.PI / 2 - Math.atan2(local.y, local.x);
      let { x, y } = planetarium.azel2xy(heading, pitch);
      // if (x == -1 && y == -1) continue;
      const name = "ISS (ZARYA)";
      // let name = allSats[satIndex].name;
      ctx.font = "18px sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(x + 10, y - 15, ctx.measureText(name).width + 10, 25);
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 0.5;
      ctx.fillText(name, x + 15, y);
      ctx.strokeText(name, x + 15, y);
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
      // }

      planetarium.drawImmediate();

      listeners.push(pano.addListener("zoom_changed", onChange));
      listeners.push(pano.addListener("pov_changed", onChange));

      return () => {
        for (const listener in listeners) {
          listeners.remove(listener);
        }
      };
      // loopCount++
    };
  }, [pano, view]);

  return (
    <motion.div
      className="street-view-wrapper"
      layoutId="box"
      initial={false}
      dragTransition={{
        modifyTarget,
        power: 0,
        min: 0,
        max: 200,
        timeConstant: 250,
      }}
      variants={{
        minimized: { height: "25vh", borderRadius: "10px" },
        full: { height: "70vh", borderRadius: "5px" },
      }}
      animate={view}
      ref={dockRef}
      drag={view === "minimized"}
      dragConstraints={containerRef}
      dragElastic={0}
      layout
    >
      <button
        style={{
          padding: "12px 8px",
          backgroundColor: "#0A202D",
          color: "#efefef",
          fontSize: "20px",
          border: 0,
        }}
        onClick={() => setView(view === "minimized" ? "full" : "minimized")}
      >
        Switch
      </button>
      <div
        style={{
          borderRadius: "22px",
          backgroundColor: "#1A506B",
          position: "relative",
          height: "100%",
          width: "100%",
          padding: "20px",
        }}
      >
        <div style={{ position: "relative", height: "100%", width: "100%" }}>
          <div
            style={{
              position: "absolute",
              top: "25px",
              left: "25px",
              zIndex: 10000,
              color: "white",
            }}
          >
            <div style={{ fontFamily: "monospace" }}>
              {new Date().toDateString()}
            </div>
            <h3
              style={{
                fontFamily: "monospace !important",
                fontSize: "24px",
                marginBottom: "5px",
              }}
            >
              STREET VIEW
            </h3>
            <p>Track and spot the ISS from your yard.</p>
          </div>
          <div
            style={{
              display: "block",
              backgroundColor: "rgb(229, 227, 223)",
              overflow: "hidden",
              position: "absolute",
              height: "100%",
              borderRadius: "12px",
              width: "100%",
              pointerEvents: view === "minimized" ? "none" : "all",
            }}
            ref={streetViewRef}
          ></div>
          <div
            ref={skyRef}
            className="streetView"
            id="virtualSky"
            style={{
              zIndex: "97",
              fontSize: "12px",
              borderRadius: "12px",
              pointerEvents: "none",
              position: "relative",
              height: "100%",
              width: "100%",
            }}
          ></div>
          <canvas
            ref={overlayRef}
            className="streetView"
            style={{
              position: "absolute",
              borderRadius: "12px",
              width: "100%",
              height: "100%",
              left: "0",
              top: "0",
              display: "block",
              zIndex: "98",
              pointerEvents: "none",
            }}
          ></canvas>
        </div>
      </div>
    </motion.div>
  );
}
