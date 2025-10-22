import * as React from "react"
import Svg, { SvgProps, G, Path, Circle, Rect } from "react-native-svg"
export const SvgComponent = (props: SvgProps) => (
  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" {...props}>
    <G data-name="School Building">
      <Path
        d="M44 40V25.75c2.3 1.29 14 7.87 14 7.87V40zM6 40v-6.38L16 28c.064-.036 1.743-.984 4-2.25V40zm38 4h14v16H44zM6 44h14v16H6z"
        style={{
          fill: "#fcd354",
        }}
      />
      <Path
        d="M44 40h17v4H44zM3 40h17v4H3z"
        style={{
          fill: "#ffb125",
        }}
      />
      <Path
        d="M20 60V21.75L32 15l12 6.75V60H20z"
        style={{
          fill: "#ffe18d",
        }}
      />
      <Circle
        cx={32}
        cy={29}
        r={7}
        style={{
          fill: "#fcd354",
        }}
      />
      <Path
        d="M26 45h12v15H26z"
        style={{
          fill: "#fcd354",
        }}
      />
      <Path
        d="M32 1h10v7H32zm16 47h6v12h-6z"
        style={{
          fill: "#ffb125",
        }}
      />
      <Rect
        width={8}
        height={14}
        x={9}
        y={47}
        rx={1}
        ry={1}
        style={{
          fill: "#ffb125",
        }}
      />
      <Path
        d="M10 48h6v12h-6z"
        style={{
          fill: "#ffb125",
        }}
      />
      <Path
        d="m32 15-14.88 8.369L16 20l16-9 16 9-1.12 3.37L32 15z"
        style={{
          fill: "#fcd354",
        }}
      />
      <Path
        d="M1 60h62v3H1z"
        style={{
          fill: "#494a59",
        }}
      />
      <Path
        d="M24 41h16v4H24z"
        style={{
          fill: "#ffb125",
        }}
      />
      <Path
        d="M32 37a8 8 0 1 0-8-8 8.01 8.01 0 0 0 8 8zm0-14a6 6 0 1 1-6 6 6.007 6.007 0 0 1 6-6z"
        style={{
          fill: "#231e23",
        }}
      />
      <Path
        d="M63 59h-4V45h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2v-3.666l1.51.85a.998.998 0 0 0 1.361-.381.998.998 0 0 0-.38-1.362L58.52 32.77c-.01-.006-.018-.016-.03-.022L45 25.165V23.46l1.39.782a1.001 1.001 0 0 0 1.44-.556l1.12-3.37a1 1 0 0 0-.46-1.187L33 10.416V9h9a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1H32a1 1 0 0 0-1 1v9.416l-15.49 8.713a.999.999 0 0 0-.459 1.186l1.12 3.37a1 1 0 0 0 1.44.556L19 23.46v1.705s.146-.08-13.49 7.583c-.01.006-.018.015-.028.022L2.51 34.44a1 1 0 1 0 .98 1.743l1.51-.85V39H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2v14H1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h62a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1zm-6 0h-2V48a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v11h-2V45h12zm-4 0h-4V49h4zm7-16H45v-2h15zm-3-4H45V27.46l12 6.75zM33 2h8v5h-8zM17.209 20.467 32 12.147l14.791 8.32-.477 1.437L32.49 14.13a.997.997 0 0 0-.98 0l-13.824 7.775zM43 22.335V59h-4V46h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H24a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1v13h-4V22.335l11-6.188zM27 59V46h4v13zm-2-15v-2h14v2zm8 2h4v13h-4zM7 34.21l12-6.75V39H7zM4 41h15v2H4zm3 4h12v14h-2V48a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v11H7zm8 14h-4V49h4zm47 3H2v-1h60z"
        style={{
          fill: "#231e23",
        }}
      />
      <Path
        d="M33.293 31.707a1 1 0 0 0 1.414-1.414L33 28.586V26a1 1 0 0 0-2 0v3a1 1 0 0 0 .293.707z"
        style={{
          fill: "#231e23",
        }}
      />
    </G>
  </Svg>
)
export default SvgComponent
