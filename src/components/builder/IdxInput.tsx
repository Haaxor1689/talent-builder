import { type Control, useController } from 'react-hook-form';
import { NotebookTabs } from 'lucide-react';

import { type TalentFormT } from '~/server/api/types';

import TextButton from '../styled/TextButton';

type Props = {
	control: Control<TalentFormT>;
};

const IdxInput = ({ control }: Props) => {
	const { field } = useController({ name: 'index', control });
	return (
		<TextButton
			icon={NotebookTabs}
			onClick={() => {
				field.onChange((field.value + 1) % 3);
			}}
		>
			Tab{field.value + 1}
		</TextButton>
	);
};

export default IdxInput;
