import Spinner from '#components/styled/Spinner.tsx';

const Loading = () => (
	<div className="my-6 flex grow items-center justify-center">
		<Spinner className="icon-size-14" />
	</div>
);

export default Loading;
