export const bounds = {
	w: 768,
	h: 1024,
};
export const center = {
	x: bounds.w / 2,
	y: bounds.h / 2,
};
export const random = {
	x: (margin = 0) => margin + Math.random() * (bounds.w - margin * 2),
	y: (margin = 0) => margin + Math.random() * (bounds.h - margin * 2),
};
