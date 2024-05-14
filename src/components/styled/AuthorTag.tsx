type Props = {
	image?: string | null;
	name?: string | null;
	isAdmin?: boolean | null;
};

const AuthorTag = ({ image, name, isAdmin }: Props) => (
	<>
		<div
			className="size-7 rounded-full bg-contain"
			style={{
				backgroundImage: `url(${image})`
			}}
		/>
		<span className={isAdmin ? 'font-semibold text-green' : undefined}>
			{name}
		</span>
	</>
);

export default AuthorTag;
