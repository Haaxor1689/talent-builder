import cls from 'classnames';

type Props = React.DetailedHTMLProps<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
> & { dark?: boolean };

const Button = ({ className, dark, ...props }: Props) => (
	<button
		type="button"
		{...props}
		className={cls('rounded p-3', className, {
			['hover:bg-zinc-800']: dark,
			['hover:bg-zinc-900']: !dark
		})}
	/>
);

export default Button;
