const NotFound = () => (
	<div className="mx-auto flex max-w-screen-sm grow flex-col justify-center gap-4 p-6 text-center">
		<h2 className="text-8xl">404</h2>
		<h3 className="text-4xl">Talent tree you are looking for was not found</h3>
		<p className="text-blueGray">
			Make sure you have correct url and that you are not trying to open someone
			else&apos;s local talent tree.
		</p>
	</div>
);

export default NotFound;
