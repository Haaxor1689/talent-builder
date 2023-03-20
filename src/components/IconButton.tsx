import { type IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ComponentProps } from 'react';

import Button from './Button';

type Props = Omit<ComponentProps<typeof Button>, 'children'> & {
	title: string;
	icon: IconProp;
};

const IconButton = ({ icon, ...props }: Props) => (
	<Button {...props}>
		<FontAwesomeIcon icon={icon} />
	</Button>
);

export default IconButton;
