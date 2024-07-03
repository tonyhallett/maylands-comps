import { CSSProperties } from "react";
import { MGColors } from "./MGColors";

interface MGLogoProps {
  ribbonColor?: CSSProperties["fill"];
  ribbonTextColor?: CSSProperties["fill"];
  handleColor?: CSSProperties["fill"];
  rubberColor?: CSSProperties["fill"];
  mAndGColor?: CSSProperties["fill"];
  showRibbon?: boolean;
  showRibbonText?: boolean;
}

export default function MGLogo({
  ribbonColor = MGColors.ribbonGreen,
  ribbonTextColor = MGColors.rubberPurple,
  handleColor = MGColors.orangeHandle,
  rubberColor = MGColors.rubberPurple,
  mAndGColor = "white",
  showRibbon = true,
  showRibbonText = true,
}: MGLogoProps) {
  return (
    <svg
      viewBox="0 0 234.07793 176.15306"
      version="1.1"
      id="svg21"
      xmlns="http://www.w3.org/2000/svg"
    >
      {showRibbon && (
        <g
          id="ribbon"
          style={{ display: "inline" }}
          transform="translate(-31.461038,-13.166014)"
        >
          <path
            id="ribbonBack"
            style={{
              display: "inline",
              opacity: 1,
              fill: ribbonColor,
              fillOpacity: 1,
              stroke: "none",
              strokeWidth: 4.99999,
              strokeDasharray: "none",
            }}
            d="m 126.67237,127.07855 c -40.562576,1.72567 -66.086404,8.67416 -66.086404,18.603 v 20.6747 c 2.960702,-13.29908 29.134923,-18.85157 54.087134,-20.93567 0.19416,-1.76038 1.49841,-3.42002 3.0825,-4.19251 5.18979,-3.40261 10.38278,-6.88687 15.18047,-10.82466 -1.94135,-1.36185 -4.04948,-2.48662 -6.2637,-3.32486 z m 43.0351,0.28112 c -1.98297,0.82638 -3.87231,1.88721 -5.64617,3.11402 4.81921,3.93784 10.13031,7.37778 15.29313,10.88616 2.00361,0.85691 3.34235,3.17824 2.99465,5.31182 24.32636,2.73583 50.45383,8.21779 53.84477,18.21749 v -19.20761 c 0,-8.86833 -31.19089,-16.11192 -66.48638,-18.32188 z"
          />
          <path
            style={{
              display: "inline",
              fill: ribbonColor,
              fillOpacity: 1,
              stroke: "none",
              strokeWidth: 4.98099,
              strokeDasharray: "none",
            }}
            d="m 60.585968,145.62412 v 20.4148 c 4.519212,15.55535 46.515052,23.29776 87.800382,23.28013 41.28533,-0.0176 81.86015,-7.7953 87.80766,-23.28013 v -20.4148 c -6.48601,15.84872 -45.81498,22.74832 -87.80766,23.11305 -41.99269,0.36472 -76.785055,-3.88317 -87.800382,-23.11305 z"
            id="ribbonFront"
          />
          {showRibbonText && (
            <g
              id="ribbonText"
              transform="translate(-0.27434533)"
              style={{ display: "inline" }}
            >
              <text
                style={{
                  fontWeight: "bold",
                  fontSize: "12.7921px",
                  fontFamily: "sans-serif",
                  display: "inline",
                  fill: ribbonTextColor,
                  strokeWidth: 4.5327,
                }}
                x="250.06436"
                y="221.23373"
                id="text461-6-7-7"
                transform="matrix(0.85220172,-0.32710474,0,1.1734311,0,0)"
              >
                <tspan
                  id="tspan459-1-2-3"
                  style={{
                    fill: ribbonTextColor,
                    fillOpacity: 1,
                    strokeWidth: 4.53271,
                  }}
                  x="250.06436"
                  y="221.23373"
                >
                  C
                </tspan>
              </text>
              <text
                style={{
                  fontStyle: "normal",
                  fontVariant: "normal",
                  fontWeight: "bold",
                  fontStretch: "normal",
                  fontSize: "13.054px",
                  fontFamily: "sans-serif",
                  fontVariantLigatures: "normal",
                  fontVariantCaps: "normal",
                  fontVariantNumeric: "normal",
                  fontVariantEastAsian: "normal",
                  display: "inline",
                  fill: ribbonTextColor,
                  fillOpacity: 1,
                  strokeWidth: 4.6255,
                }}
                x="244.27086"
                y="196.09242"
                id="text461-6-7"
                transform="matrix(0.83935134,-0.21986401,0,1.1913962,0,0)"
              >
                <tspan
                  id="tspan459-1-2"
                  style={{
                    fill: ribbonTextColor,
                    fillOpacity: 1,
                    strokeWidth: 4.62551,
                  }}
                  x="244.27086"
                  y="196.09242"
                >
                  T
                </tspan>
              </text>
              <text
                style={{
                  fontWeight: "bold",
                  fontSize: "14.5609px",
                  fontFamily: "sans-serif",
                  display: "inline",
                  fill: ribbonTextColor,
                  strokeWidth: 5.15937,
                }}
                x="208.43462"
                y="205.84204"
                id="text461-6"
                transform="matrix(0.93270601,-0.18571788,0,1.0721492,0,0)"
              >
                <tspan
                  id="tspan459-1"
                  style={{
                    fill: ribbonTextColor,
                    fillOpacity: 1,
                    strokeWidth: 5.15938,
                  }}
                  x="208.43462"
                  y="205.84204"
                >
                  T
                </tspan>
              </text>
              <text
                style={{
                  fontWeight: "bold",
                  fontSize: "13.6136px",
                  fontFamily: "sans-serif",
                  display: "inline",
                  fill: ribbonTextColor,
                  strokeWidth: 4.8237,
                }}
                x="197.36214"
                y="190.54028"
                id="text461-5-9-0-2-2-0-0-1-9"
                transform="matrix(0.92068721,-0.11799303,0,1.0861452,0,0)"
              >
                <tspan
                  id="tspan459-4-4-7-7-9-5-4-7-3"
                  style={{
                    fontWeight: "bold",
                    fill: ribbonTextColor,
                    fillOpacity: 1,
                    strokeWidth: 4.82371,
                  }}
                  x="197.36214"
                  y="190.54028"
                >
                  n
                </tspan>
              </text>
              <text
                style={{
                  fontWeight: "bold",
                  fontSize: "13.6523px",
                  fontFamily: "sans-serif",
                  display: "inline",
                  fill: ribbonTextColor,
                  strokeWidth: 4.83742,
                }}
                x="174.58609"
                y="183.1317"
                id="text461-5-9-0-2-2-0-0"
                transform="matrix(0.94273356,-0.05427977,0,1.0607451,0,0)"
              >
                <tspan
                  id="tspan459-4-4-7-7-9-5-4"
                  style={{
                    fontWeight: "bold",
                    fill: ribbonTextColor,
                    fillOpacity: 1,
                    strokeWidth: 4.83743,
                  }}
                  x="174.58609"
                  y="183.1317"
                >
                  e
                </tspan>
              </text>
              <text
                style={{
                  fontWeight: "bold",
                  fontSize: "13.3068px",
                  fontFamily: "sans-serif",
                  display: "inline",
                  fill: ribbonTextColor,
                  strokeWidth: 4.71499,
                }}
                x="188.37746"
                y="183.41296"
                id="text461-5-9-0-2-2-0-0-1"
                transform="matrix(0.92004193,-0.08034157,0,1.086907,0,0)"
              >
                <tspan
                  id="tspan459-4-4-7-7-9-5-4-7"
                  style={{
                    fontWeight: "bold",
                    fill: ribbonTextColor,
                    fillOpacity: 1,
                    strokeWidth: 4.715,
                  }}
                  x="188.37746"
                  y="183.41296"
                >
                  e
                </tspan>
              </text>
              <text
                style={{
                  fontWeight: "bold",
                  fontSize: "14.0945px",
                  fontFamily: "sans-serif",
                  display: "inline",
                  fill: ribbonTextColor,
                  strokeWidth: 4.99412,
                }}
                x="168.05899"
                y="178.13101"
                id="text461-5-9-0-2-2-0"
                transform="matrix(0.93863046,-0.02702076,0,1.065382,0,0)"
              >
                <tspan
                  id="tspan459-4-4-7-7-9-5"
                  style={{
                    fontWeight: "bold",
                    fill: ribbonTextColor,
                    fillOpacity: 1,
                    strokeWidth: 4.99413,
                  }}
                  x="168.05899"
                  y="178.13101"
                >
                  r
                </tspan>
              </text>
              <text
                style={{
                  fontWeight: "bold",
                  fontSize: "14.6214px",
                  fontFamily: "sans-serif",
                  display: "inline",
                  fill: ribbonTextColor,
                  strokeWidth: 5.1808,
                }}
                x="151.71082"
                y="178.71472"
                id="text461"
                transform="scale(0.96509991,1.0361622)"
              >
                <tspan
                  id="tspan459"
                  style={{
                    fill: ribbonTextColor,
                    fillOpacity: 1,
                    strokeWidth: 5.18081,
                  }}
                  x="151.71082"
                  y="178.71472"
                >
                  G
                </tspan>
              </text>
              <text
                style={{
                  fontWeight: "bold",
                  fontSize: "13.9294px",
                  fontFamily: "sans-serif",
                  display: "inline",
                  fill: ribbonTextColor,
                  strokeWidth: 4.93562,
                }}
                x="142.04939"
                y="173.89815"
                id="text461-5-9-0-2-2"
                transform="matrix(0.94975601,0.01363375,0,1.052902,0,0)"
              >
                <tspan
                  id="tspan459-4-4-7-7-9"
                  style={{
                    fontWeight: "bold",
                    fill: ribbonTextColor,
                    fillOpacity: 1,
                    strokeWidth: 4.93563,
                  }}
                  x="142.04939"
                  y="173.89815"
                >
                  s
                </tspan>
              </text>
              <text
                style={{
                  fontWeight: "bold",
                  fontSize: "14.0217px",
                  fontFamily: "sans-serif",
                  display: "inline",
                  fill: ribbonTextColor,
                  strokeWidth: 4.96829,
                }}
                x="132.88802"
                y="167.73973"
                id="text461-5-5-3"
                transform="matrix(0.94350854,0.05111351,0,1.0598738,0,0)"
              >
                <tspan
                  id="tspan459-4-7-9"
                  style={{
                    fontWeight: "bold",
                    fill: ribbonTextColor,
                    fillOpacity: 1,
                    strokeWidth: 4.9683,
                  }}
                  x="132.88802"
                  y="167.73973"
                >
                  d
                </tspan>
              </text>
              <text
                style={{
                  fontWeight: "bold",
                  fontSize: "14.0592px",
                  fontFamily: "sans-serif",
                  display: "inline",
                  fill: ribbonTextColor,
                  strokeWidth: 4.98163,
                }}
                x="123.31708"
                y="162.7796"
                id="text461-5-9-0-2"
                transform="matrix(0.94098323,0.08721245,0,1.0627182,0,0)"
              >
                <tspan
                  id="tspan459-4-4-7-7"
                  style={{
                    fontWeight: "bold",
                    fill: ribbonTextColor,
                    strokeWidth: 4.98164,
                  }}
                  x="123.31708"
                  y="162.7796"
                >
                  n
                </tspan>
              </text>
              <text
                style={{
                  fontWeight: "bold",
                  fontSize: "13.9717px",
                  fontFamily: "sans-serif",
                  display: "inline",
                  fill: ribbonTextColor,
                  strokeWidth: 4.95056,
                }}
                x="113.25903"
                y="159.46361"
                id="text461-5-9-0"
                transform="matrix(0.94688917,0.12532197,0,1.0560898,0,0)"
              >
                <tspan
                  id="tspan459-4-4-7"
                  style={{
                    fontWeight: "bold",
                    fill: ribbonTextColor,
                    strokeWidth: 4.95057,
                  }}
                  x="113.25903"
                  y="159.46361"
                >
                  a
                </tspan>
              </text>
              <text
                style={{
                  fontWeight: "bold",
                  fontSize: "14.0571px",
                  fontFamily: "sans-serif",
                  display: "inline",
                  fill: ribbonTextColor,
                  strokeWidth: 4.98085,
                }}
                x="109.1979"
                y="158.16434"
                id="text461-5-5"
                transform="matrix(0.94112936,0.12828296,0,1.0625532,0,0)"
              >
                <tspan
                  id="tspan459-4-7"
                  style={{
                    fontWeight: "bold",
                    fill: ribbonTextColor,
                    strokeWidth: 4.98086,
                  }}
                  x="109.1979"
                  y="158.16434"
                >
                  l
                </tspan>
              </text>
              <text
                style={{
                  fontWeight: "bold",
                  fontSize: "13.8549px",
                  fontFamily: "sans-serif",
                  display: "inline",
                  fill: ribbonTextColor,
                  strokeWidth: 4.90921,
                }}
                x="99.186104"
                y="155.6283"
                id="text461-5-9-9"
                transform="matrix(0.95486679,0.17482221,0,1.0472665,0,0)"
              >
                <tspan
                  id="tspan459-4-4-5"
                  style={{
                    fontWeight: "bold",
                    fill: ribbonTextColor,
                    strokeWidth: 4.90922,
                  }}
                  x="99.186104"
                  y="155.6283"
                >
                  y
                </tspan>
              </text>
              <text
                style={{
                  fontWeight: "bold",
                  fontSize: "13.4586px",
                  fontFamily: "sans-serif",
                  display: "inline",
                  fill: ribbonTextColor,
                  strokeWidth: 4.76878,
                }}
                x="95.578049"
                y="141.589"
                id="text461-5-9"
                transform="matrix(0.90997018,0.23963366,0,1.0989371,0,0)"
              >
                <tspan
                  id="tspan459-4-4"
                  style={{
                    fontWeight: "bold",
                    fill: ribbonTextColor,
                    strokeWidth: 4.76879,
                  }}
                  x="95.578049"
                  y="141.589"
                >
                  a
                </tspan>
              </text>
              <text
                style={{
                  fontWeight: "bold",
                  fontSize: "13.5005px",
                  fontFamily: "sans-serif",
                  display: "inline",
                  fill: ribbonTextColor,
                  strokeWidth: 4.78366,
                }}
                x="86.539467"
                y="130.16492"
                id="text461-5"
                transform="matrix(0.87185061,0.29560363,0,1.1469855,0,0)"
              >
                <tspan
                  id="tspan459-4"
                  style={{
                    fontWeight: "bold",
                    fill: ribbonTextColor,
                    strokeWidth: 4.78366,
                  }}
                  x="86.539467"
                  y="130.16492"
                >
                  M
                </tspan>
              </text>
            </g>
          )}
        </g>
      )}

      <g
        id="batsRotated"
        transform="rotate(45,233.30288,-559.83721)"
        style={{ display: "inline" }}
      >
        <g id="batsTranslated" transform="translate(-0.06149429,0.06149429)">
          <g
            id="leftBat"
            style={{ display: "inline" }}
            transform="matrix(1.3640474,0,0,1.3640474,437.27329,-142.13535)"
          >
            <path
              id="leftHandle"
              style={{
                display: "inline",
                fill: handleColor,
                strokeWidth: 0.328999,
              }}
              d="m 114.87286,84.477529 2.7e-4,19.991971 h 0.005 v 20.80662 c 6.02756,-10.41641 12.69673,-13.34604 18.45003,-14.20567 0.13892,-2.04373 0.17677,-4.09348 0.0766,-6.14742 -0.0379,-2.07099 -0.0726,-4.18603 -0.29494,-6.270377 -5.70428,-0.900582 -12.28404,-3.888001 -18.23679,-14.175124 z m 34.17004,14.487478 c -0.1123,1.071553 -0.16258,2.144713 -0.15805,3.203363 -0.10048,2.87348 -0.12144,5.74777 0.0198,8.60661 3.10075,0.28719 7.3351,0.97739 15.03128,2.5307 1.55093,0.31561 1.95589,-0.79748 1.9577,-1.5323 v -7.76437 l -0.005,2.7e-4 v -6.029017 c -0.002,-0.734818 -0.40598,-1.84871 -1.9569,-1.533105 -7.57879,1.529623 -11.80061,2.222661 -14.88877,2.517849 z"
            />
            <path
              id="leftRubber"
              style={{
                display: "inline",
                fill: rubberColor,
                strokeWidth: 0.531634,
              }}
              d="m 78.622074,63.282442 a 41.605022,41.605022 0 0 0 -41.605212,41.605208 41.605022,41.605022 0 0 0 41.605212,41.6047 41.605022,41.605022 0 0 0 32.164446,-15.22439 V 78.500118 A 41.605022,41.605022 0 0 0 78.622074,63.282442 Z"
            />
          </g>
          <g
            id="rightBat"
            style={{ display: "inline" }}
            transform="matrix(0,1.3640474,1.3640474,0,486.70572,-191.56778)"
          >
            <path
              id="rightHandle"
              style={{
                display: "inline",
                fill: handleColor,
                strokeWidth: 0.328999,
              }}
              d="m 114.87309,84.477531 v 19.992059 h 0.005 v 20.80648 c 8.66756,-14.97866 18.66365,-14.48099 25.35194,-14.59962 6.6883,-0.11862 7.94655,-0.55143 23.70605,2.6293 1.55093,0.31561 1.95569,-0.79739 1.9575,-1.53221 v -7.76438 h -0.005 v -6.029094 c -0.002,-0.734818 -0.40606,-1.848328 -1.95698,-1.532723 -15.75951,3.180732 -17.01776,2.748442 -23.70605,2.629814 -6.68829,-0.118629 -16.6849,0.379042 -25.35246,-14.599626 z"
            />
            <path
              id="rightRubber"
              style={{
                display: "inline",
                fill: rubberColor,
                strokeWidth: 0.531634,
              }}
              d="m 78.622074,63.282442 a 41.605022,41.605022 0 0 0 -41.605212,41.605208 41.605022,41.605022 0 0 0 41.605212,41.6047 41.605022,41.605022 0 0 0 32.164446,-15.22439 V 78.500118 A 41.605022,41.605022 0 0 0 78.622074,63.282442 Z"
            />
          </g>
        </g>
      </g>
      <g
        id="MandG"
        style={{ display: "inline" }}
        transform="translate(-17.565717,-47.413206)"
      >
        <g id="M" style={{ display: "inline" }}>
          <path
            id="circle4255"
            style={{
              display: "inline",
              fill: mAndGColor,
              stroke: "none",
              strokeWidth: 3.24999,
              strokeDasharray: "none",
            }}
            d="m 34.637241,92.757826 a 41.298236,41.298236 0 0 0 10.468941,40.605784 41.298236,41.298236 0 0 0 32.037919,11.97931 l -7e-6,-12.13037 a 29.202261,29.202261 0 0 1 -23.484762,-8.40209 29.202261,29.202261 0 0 1 -8.513719,-21.55091 l 28.261187,2.4e-4 2e-6,-28.260956 a 29.202261,29.202261 0 0 1 21.550671,8.513485 29.202261,29.202261 0 0 1 8.413967,23.484761 H 115.5075 A 41.298236,41.298236 0 0 0 103.51062,74.95917 41.298236,41.298236 0 0 0 62.904602,64.490465 l 2.39e-4,28.267362 z"
          />
        </g>
        <g id="G" style={{ display: "inline" }}>
          <path
            id="circle4183-3"
            style={{
              display: "inline",
              fill: mAndGColor,
              stroke: "none",
              strokeWidth: 3.24999,
              strokeDasharray: "none",
            }}
            d="m 224.16488,74.962466 a 41.298236,41.298236 0 0 0 -58.40467,2.37e-4 41.298236,41.298236 0 0 0 -11.95912,32.447157 l -0.0575,0.0575 37.91664,37.91664 0.0573,-0.0573 a 41.298236,41.298236 0 0 0 32.4474,-11.95936 41.298236,41.298236 0 0 0 3.69073,-4.23038 l -7.8311,-7.8311 -9.81721,-9.81721 -8.05484,8.05485 8.9384,8.9384 a 29.202261,29.202261 0 0 1 -15.39239,4.85338 L 165.79254,103.4293 a 29.202261,29.202261 0 0 1 8.52086,-19.913496 29.202261,29.202261 0 0 1 41.29837,-2.37e-4 29.202261,29.202261 0 0 1 8.34294,17.179933 h 12.15935 A 41.298236,41.298236 0 0 0 224.16491,74.962438 Z"
          />
        </g>
      </g>
    </svg>
  );
}
