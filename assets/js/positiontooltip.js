const tooltipHorizontalPadding = 6,
	tooltipVerticalPadding = 6;

function positionTooltip(tooltip, container, event, position) {

	const containerSize = container.node().getBoundingClientRect(),
		tooltipSize = tooltip.node().getBoundingClientRect(),
		elementSize = event.currentTarget.getBoundingClientRect();

	const verticalTop = () => Math.max(0, elementSize.top - containerSize.top - tooltipSize.height - tooltipVerticalPadding) + "px",
		verticalCenter = () => elementSize.top - containerSize.top + (elementSize.height / 2) - (tooltipSize.height / 2) + "px",
		verticalBottom = () => Math.min(containerSize.height - tooltipSize.height, elementSize.bottom - containerSize.top + tooltipVerticalPadding) + "px",
		horizontalLeft = () => Math.max(0, elementSize.left - tooltipSize.width - containerSize.left - tooltipHorizontalPadding) + "px",
		horizontalCenter = () => Math.max(0, Math.min(containerSize.width - tooltipSize.width - tooltipHorizontalPadding,
			elementSize.left - containerSize.left + (elementSize.width / 2) - (tooltipSize.width / 2))) + "px",
		horizontalRight = () => elementSize.right + tooltipHorizontalPadding + tooltipSize.width - containerSize.left > containerSize.width ?
		elementSize.right - tooltipSize.width - containerSize.left - tooltipHorizontalPadding + "px" :
		elementSize.right - containerSize.left + tooltipHorizontalPadding + "px";

	const top = position === "top" ? verticalTop() : position === "bottom" ? verticalBottom() : verticalCenter();
	const left = position === "left" ? horizontalLeft() : position === "right" ? horizontalRight() : horizontalCenter();

	tooltip.style("top", top)
		.style("left", left);
};

export { positionTooltip };