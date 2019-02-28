#version 300 es
precision highp float;

uniform vec3 u_Eye;

in vec4 fs_Col;
in vec4 fs_Nor;
in vec4 fs_Pos;

out vec4 out_Col;

const vec3 light_Vec = vec3(0., 2., 1.);
const vec3 light_Col = vec3(249., 224., 192.) / 255.;
const vec3 shadowColor = vec3(252., 53., 205.) / 255.;

void main()
{
	float lambert_light = clamp(dot(normalize(vec3(fs_Nor)), normalize(light_Vec)), 0.0, 1.0);
	float lambert_eye	= clamp(dot(normalize(vec3(fs_Nor)), normalize(u_Eye)), 0.0, 1.0);
	// Add ambient lighting
	float ambientTerm = 0.2;
	vec3 lightIntensity = vec3(3. * lambert_light * light_Col + 2. * lambert_eye * vec3(1.)) / 5. + ambientTerm;
	vec3 shadow = 0.3 * shadowColor * (1.0 - lightIntensity);
	out_Col = clamp(fs_Col * vec4(lightIntensity + shadow, 1.), 0.0f, 1.0f);
	out_Col.a = 1.;
}
