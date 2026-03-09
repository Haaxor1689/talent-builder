import cls from 'classnames';

type Props = { className?: string };

const Spinner = ({ className }: Props) => (
	<div
		className={cls(
			`border-blue-gray inline-block aspect-square size-(--icon-size) animate-spin rounded-full border-[round(up,calc(var(--icon-size)*0.1),2px)] border-t-[currentColor] opacity-75`,
			className
		)}
	/>
);

export default Spinner;
