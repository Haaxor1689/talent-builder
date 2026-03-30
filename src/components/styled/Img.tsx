'use client';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
	fallback?: string;
};

const Img = ({ fallback, ...props }: Props) => (
	// eslint-disable-next-line jsx-a11y/alt-text
	<img
		onError={e => {
			if (fallback) e.currentTarget.src = fallback;
		}}
		{...props}
	/>
);

export default Img;
