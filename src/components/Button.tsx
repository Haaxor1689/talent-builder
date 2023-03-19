import cls from 'classnames';

type Props = React.DetailedHTMLProps<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
>;

const Button = ({ className, ...props }: Props) => (
	<button
		{...props}
		className={cls('rounded hover:bg-zinc-900 p-2', className)}
	/>
);

export default Button;
