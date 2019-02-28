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

float noise(float i) {
	return fract(sin(vec2(203.311f * float(i), float(i) * sin(0.324f + 140.0f * float(i))))).x;
}

float interpNoise1D(float x) {
	float intX = floor(x);	
	float fractX = fract(x);

	float v1 = noise(intX);
	float v2 = noise(intX + 1.0f);
	return mix(v1, v2, fractX);
}

float fbm(float x) {
	float total = 0.0f;
	float persistence = 0.5f;
	int octaves = 8;

	for(int i = 0; i < octaves; i++) {
		float freq = pow(2.0f, float(i));
		float amp = pow(persistence, float(i));

		total += interpNoise1D(x * freq) * amp;
	}

	return total;
}

void main()
{

	vec3 a = vec3(0.71, 0.52, 0.0);
	vec3 b = vec3(0.56, 0.68, 1.0);
	vec3 c = vec3(0.70, 0.41, 0.36);
	vec3 d = vec3(0.00, 0.23, 0.36);
	
	float t = fract(fbm(fs_Pos.x * 2.0 + cos(fs_Pos.y + fs_Pos.z)));
	vec3 col = mix(a + b * cos(6.28318531 * (c * t + d)), vec3(fs_Col), 1. - 0.6 * t);

	float lambert_light = clamp(dot(normalize(vec3(fs_Nor)), normalize(light_Vec)), 0.0, 1.0);
	float lambert_eye	= clamp(dot(normalize(vec3(fs_Nor)), normalize(u_Eye)), 0.0, 1.0);
	// Add ambient lighting
	float ambientTerm = 0.2;
	vec3 lightIntensity = vec3(2. * lambert_light * light_Col + lambert_eye * vec3(1.)) / 3. + ambientTerm;
	vec3 shadow = 0.3 * shadowColor * (1.0 - lightIntensity);
	out_Col = clamp(vec4(col * lightIntensity + shadow, 1.), 0.0f, 1.0f);
	out_Col.a = 1.;
}
