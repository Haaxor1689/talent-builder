const NotFound = () => (
	<div className="mx-auto flex max-w-screen-sm grow flex-col justify-center gap-4 p-6 text-center">
		<h2 className="text-8xl">404</h2>
		<h3 className="text-4xl">Talent tree you are looking for was not found</h3>
		<p className="text-blueGray">
			This local talent tree does not exist. Make sure you have correct url.
		</p>
	</div>
);

export default NotFound;
