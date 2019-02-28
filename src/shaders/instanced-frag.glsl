#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Nor;
in vec4 fs_Pos;

out vec4 out_Col;

const vec3 light_Vec = vec3(4., 2., 1.);

void main()
{
	float lambert = clamp(dot(normalize(vec3(fs_Nor)), normalize(light_Vec)), 0.0, 1.0);
	// Add ambient lighting
	float ambientTerm = 0.2;
	float lightIntensity = lambert + ambientTerm;
	//vec3 shadow = 0.3 * shadowColor * (1.0 - lightIntensity);
	out_Col = clamp(fs_Col * lightIntensity, 0.0f, 1.0f);
	out_Col.a = 1.;
}
