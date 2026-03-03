import { useState } from 'react';
import { useController } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import { Pencil } from 'lucide-react';

import Md from '../styled/Md';
import ScrollArea from '../styled/ScrollArea';
import TextButton from '../styled/TextButton';

type Props = {
	editable?: boolean;
};

const Notes = ({ editable }: Props) => {
	const [editing, setEditing] = useState(false);
	const { field } = useController({ name: 'notes' });

	if (!editable || !editing)
		return (
			<ScrollArea
				containerClassName="h-full"
				contentClassName="flex flex-col gap-4 p-3"
			>
				{editable && (
					<TextButton
						icon={Pencil}
						onClick={() => setEditing(true)}
						className="absolute top-2 right-2"
					>
						Edit Notes
					</TextButton>
				)}
				<Md text={field.value || 'No notes available.'} />
			</ScrollArea>
		);

	return (
		<div className="relative flex h-full flex-col">
			<TextButton
				icon={Pencil}
				onClick={() => setEditing(false)}
				className="absolute top-2 right-2"
			>
				Stop Editing
			</TextButton>
			<TextareaAutosize
				value={field.value}
				onChange={e => field.onChange(e.currentTarget.value)}
				placeholder="Insert notes here..."
				className="haax-input-hocus shrink p-3"
			/>
		</div>
	);
};

export default Notes;
