import { type Control, useController } from 'react-hook-form';
import { NotebookTabs } from 'lucide-react';

import { type TalentFormT } from '~/server/api/types';

import TextButton from '../styled/TextButton';

type Props = {
	control: Control<TalentFormT>;
	disabled?: boolean;
};

const IdxInput = ({ control, disabled }: Props) => {
	const { field } = useController({ name: 'index', control });
	return (
		<TextButton
			icon={NotebookTabs}
			disabled={disabled}
			onClick={() => {
				field.onChange((field.value + 1) % 3);
			}}
			className="text-white"
		>
			Tab{field.value + 1}
		</TextButton>
	);
};

export default IdxInput;
