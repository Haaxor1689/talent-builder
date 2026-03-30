type Props = {
	title: string;
	children?: React.ReactNode;
};

const PageTitle = ({ title, children }: Props) => (
	<div className="flex items-center flex-col text-center md:text-left md:flex-row gap-2 -mb-3">
		<h2 className="haax-color">{title}</h2>
		{children}
	</div>
);

export default PageTitle;
