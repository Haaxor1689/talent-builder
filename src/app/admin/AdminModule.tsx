import { type HTMLAttributes, type ReactNode } from 'react';

type Props = HTMLAttributes<HTMLFormElement> & {
	title: string;
	children: ReactNode;
};

const AdminModule = ({ title, children, ...props }: Props) => (
	<form {...props} className="haax-surface-3 grow">
		<h3 className="haax-color">{title}</h3>
		<hr />
		{children}
	</form>
);

export default AdminModule;
