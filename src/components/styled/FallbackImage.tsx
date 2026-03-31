'use client';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
	fallback: string;
};

const FallbackImage = ({ fallback, ...props }: Props) => (
	// oxlint-disable-next-line jsx_a11y/alt-text
	<img
		onError={e => {
			if (fallback) e.currentTarget.src = fallback;
		}}
		{...props}
	/>
);

export default FallbackImage;
