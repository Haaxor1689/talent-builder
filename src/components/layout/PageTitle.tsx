type Props = {
	title: string;
	children?: React.ReactNode;
};

const PageTitle = ({ title, children }: Props) => (
	<div className="-mb-3 flex flex-col items-center gap-2 text-center md:flex-row md:text-left">
		<h2 className="haax-color">{title}</h2>
		{children}
	</div>
);

export default PageTitle;
