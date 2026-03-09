import { useController } from 'react-hook-form';
import { NotebookTabs } from 'lucide-react';

import TextButton from '../styled/TextButton';

type Props = { disabled?: boolean };

const IdxInput = ({ disabled }: Props) => {
	const { field } = useController({ name: 'index' });
	return (
		<TextButton
			icon={<NotebookTabs />}
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
