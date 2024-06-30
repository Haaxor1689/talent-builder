import { CornerDownRight } from 'lucide-react';

const getXY = (pos: number) => [pos % 4, Math.floor(pos / 4)] as const;

type Props = {
	start: number;
	end: number;
	highlighted?: boolean;
};

const TalentArrow = ({ start, end, highlighted }: Props) => {
	const [x1, y1] = getXY(start);
	const [x2, y2] = getXY(end);

	const url = (name: string) =>
		`url("/arrows/${name}${highlighted ? '2' : ''}.png")`;

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
						width: (x1 - x2 - 1) * 64 + (x1 - x2) * 24,
						backgroundImage: url('left')
					}}
				/>
			);
		if (x1 < x2)
			return (
				<div
					className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 bg-cover bg-right"
					style={{
						height: 15,
						width: (x2 - x1 - 1) * 64 + (x2 - x1) * 24,
						backgroundImage: url('right')
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
					height: (y2 - y1 - 1) * 64 + (y2 - y1) * 24 + 32,
					backgroundImage: url('down')
				}}
			>
				<div
					className="pointer-events-none absolute -translate-y-1/2 bg-left"
					style={{
						height: 15,
						width: (x1 - x2 - 1) * 64 + (x1 - x2) * 24 + 32 + 7.5,
						backgroundImage: url('leftdown')
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
					height: (y2 - y1 - 1) * 64 + (y2 - y1) * 24 + 32,
					backgroundImage: url('down')
				}}
			>
				<div
					className="pointer-events-none absolute right-0 -translate-y-1/2 bg-right"
					style={{
						height: 15,
						width: (x2 - x1 - 1) * 64 + (x2 - x1) * 24 + 32 + 7.5,
						backgroundImage: url('rightdown')
					}}
				/>
			</div>
		);

	return (
		<div
			className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 bg-bottom"
			style={{
				width: 15,
				height: (y2 - y1 - 1) * 64 + (y2 - y1) * 24,
				backgroundImage: url('down')
			}}
		/>
	);
};

export default TalentArrow;
