import cls from 'classnames';
import { CornerDownRight } from 'lucide-react';

const getXY = (pos: number) => [pos % 4, Math.floor(pos / 4)] as const;

type Props = {
	start: number;
	end: number;
	highlighted?: boolean;
};

const className = 'pointer-events-none absolute haax-tooltip-hidden';

const TalentArrow = ({ start, end, highlighted }: Props) => {
	const [x1, y1] = getXY(start);
	const [x2, y2] = getXY(end);

	const url = (name: string) =>
		`url("/arrows/${name}${highlighted ? '2' : ''}.png")`;

	if (y1 > y2)
		return (
			<CornerDownRight
				className={cls(
					'text-red bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
					className
				)}
			/>
		);

	if (y1 === y2) {
		if (x1 > x2)
			return (
				<div
					className={cls(
						'top-1/2 left-full -translate-y-1/2 bg-cover bg-left',
						className
					)}
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
					className={cls(
						'top-1/2 right-full -translate-y-1/2 bg-cover bg-right',
						className
					)}
					style={{
						height: 15,
						width: (x2 - x1 - 1) * 64 + (x2 - x1) * 24,
						backgroundImage: url('right')
					}}
				/>
			);

		return (
			<CornerDownRight
				className={cls(
					'text-red absolute bottom-0 left-0 -translate-x-1/2 -translate-y-1/2',
					className
				)}
			/>
		);
	}

	if (x1 > x2)
		return (
			<div
				className={cls(
					'bottom-full left-1/2 -translate-x-1/2 bg-bottom',
					className
				)}
				style={{
					width: 15,
					height: (y2 - y1 - 1) * 64 + (y2 - y1) * 24 + 32,
					backgroundImage: url('down')
				}}
			>
				<div
					className={cls('-translate-y-1/2 bg-left', className)}
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
				className={cls(
					'bottom-full left-1/2 -translate-x-1/2 bg-bottom',
					className
				)}
				style={{
					width: 15,
					height: (y2 - y1 - 1) * 64 + (y2 - y1) * 24 + 32,
					backgroundImage: url('down')
				}}
			>
				<div
					className={cls('right-0 -translate-y-1/2 bg-right', className)}
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
			className={cls(
				'bottom-full left-1/2 -translate-x-1/2 bg-bottom',
				className
			)}
			style={{
				width: 15,
				height: (y2 - y1 - 1) * 64 + (y2 - y1) * 24,
				backgroundImage: url('down')
			}}
		/>
	);
};

export default TalentArrow;
