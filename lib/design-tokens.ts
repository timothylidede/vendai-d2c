export const shadows = {
	l0: "none",
	l1: "0 2px 8px rgba(0,0,0,0.25)",
	l2: "0 6px 18px rgba(0,0,0,0.28)",
	l3: "0 12px 28px rgba(0,0,0,0.32)",
	l4: "0 20px 40px rgba(0,0,0,0.38)",
	// Optional inner highlight for glass/skeuo surfaces
	insetHighlight: "inset 0 1px 0 rgba(255,255,255,0.08)",
}

export const radii = {
	card: "16px",
	button: "12px",
	chip: "9999px",
}

export const motion = {
	durations: {
		xs: 0.12,
		sm: 0.18,
		md: 0.25,
		lg: 0.4,
	},
	ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
	spring: { stiffness: 220, damping: 20 },
}


