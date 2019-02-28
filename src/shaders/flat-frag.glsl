#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

void main() {
  out_Col = vec4(mix(vec3(255., 247., 216.) / 255., vec3(140., 234., 229.) / 255., cos(fs_Pos.x) + fs_Pos.y), 1.);
}
