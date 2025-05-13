export type AuthorTagProps = {
	image?: string | null;
	name?: string | null;
	isAdmin?: boolean | null;
};

const AuthorTag = ({ image, name, isAdmin }: AuthorTagProps) => (
	<>
		<div
			className="size-7 rounded-full bg-contain"
			style={{
				backgroundImage: `url(${image}), url(https://cdn.discordapp.com/embed/avatars/0.png)`
			}}
		/>
		<span className={isAdmin ? 'font-semibold text-green' : undefined}>
			{name}
		</span>
	</>
);

export default AuthorTag;
