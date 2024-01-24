import { CornerDownRight } from 'lucide-react';

const getXY = (pos: number) => [pos % 4, Math.floor(pos / 4)] as const;

type Props = {
	start: number;
	end: number;
};

const TalentArrow = ({ start, end }: Props) => {
	const [x1, y1] = getXY(start);
	const [x2, y2] = getXY(end);

	if (y1 > y2)
		return (
			<CornerDownRight className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-red" />
		);

	if (y1 === y2) {
		if (x1 > x2)
			return (
				<div
					className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 bg-cover bg-left"
					style={{
						height: 15,
						width: (x1 - x2 - 1) * 68 + (x1 - x2) * 24,
						backgroundImage: `url("https://wow.zamimg.com/images/TalentCalc/arrows/left.png")`
					}}
				/>
			);
		if (x1 < x2)
			return (
				<div
					className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 bg-cover bg-right"
					style={{
						height: 15,
						width: (x2 - x1 - 1) * 68 + (x2 - x1) * 24,
						backgroundImage: `url("https://wow.zamimg.com/images/TalentCalc/arrows/right.png")`
					}}
				/>
			);

		return (
			<CornerDownRight className="absolute bottom-0 left-0 -translate-x-1/2 -translate-y-1/2 text-red" />
		);
	}

	if (x1 > x2)
		return (
			<div
				className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 bg-bottom"
				style={{
					width: 15,
					height: (y2 - y1 - 1) * 68 + (y2 - y1) * 24 + 34,
					backgroundImage: `url("https://wow.zamimg.com/images/TalentCalc/arrows/down.png")`
				}}
			>
				<div
					className="pointer-events-none absolute -translate-y-1/2 bg-left"
					style={{
						height: 15,
						width: (x1 - x2 - 1) * 68 + (x1 - x2) * 24 + 34 + 7.5,
						backgroundImage: `url("https://wow.zamimg.com/images/TalentCalc/arrows/leftdown.png")`
					}}
				/>
			</div>
		);
	if (x1 < x2)
		return (
			<div
				className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 bg-bottom"
				style={{
					width: 15,
					height: (y2 - y1 - 1) * 68 + (y2 - y1) * 24 + 34,
					backgroundImage: `url("https://wow.zamimg.com/images/TalentCalc/arrows/down.png")`
				}}
			>
				<div
					className="pointer-events-none absolute right-0 -translate-y-1/2 bg-right"
					style={{
						height: 15,
						width: (x2 - x1 - 1) * 68 + (x2 - x1) * 24 + 34 + 7.5,
						backgroundImage: `url("https://wow.zamimg.com/images/TalentCalc/arrows/rightdown.png")`
					}}
				/>
			</div>
		);

	return (
		<div
			className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 bg-bottom"
			style={{
				width: 15,
				height: (y2 - y1 - 1) * 68 + (y2 - y1) * 24,
				backgroundImage: `url("https://wow.zamimg.com/images/TalentCalc/arrows/down.png")`
			}}
		/>
	);
};

export default TalentArrow;
