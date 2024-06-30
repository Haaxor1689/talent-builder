import { type HTMLAttributes, type ReactNode } from 'react';

type Props = HTMLAttributes<HTMLFormElement> & {
	title: string;
	children: ReactNode;
};

const AdminModule = ({ title, children, ...props }: Props) => (
	<form {...props} className="tw-surface flex flex-grow flex-col gap-2">
		<h4 className="tw-color">{title}</h4>
		<hr />
		{children}
	</form>
);

export default AdminModule;
