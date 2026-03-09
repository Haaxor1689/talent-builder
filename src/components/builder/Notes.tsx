import { useState } from 'react';
import { useController } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import { Pencil } from 'lucide-react';

import { Markdown } from '#components/Icons.tsx';

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
				contentClassName="flex flex-col gap-4 p-3 min-h-[102px]"
			>
				{editable && (
					<TextButton
						icon={<Pencil />}
						onClick={() => setEditing(true)}
						className="absolute right-2 bottom-2"
					>
						Edit Notes
					</TextButton>
				)}
				<Md text={field.value ?? 'No notes available.'} />
			</ScrollArea>
		);

	return (
		<div className="relative flex h-full flex-col">
			<TextareaAutosize
				value={field.value}
				minRows={3}
				onChange={e => field.onChange(e.currentTarget.value || null)}
				placeholder="Insert notes here..."
				className="haax-input-hocus shrink grow p-3"
			/>
			<TextButton
				icon={<Markdown />}
				type="link"
				href="https://www.markdownguide.org/basic-syntax/"
				external
				className="text-blue-gray icon-size-5 absolute bottom-2 left-2 text-sm italic"
			>
				Markdown supported
			</TextButton>
			<TextButton
				icon={<Pencil />}
				onClick={() => setEditing(false)}
				className="absolute right-2 bottom-2"
			>
				Stop Editing
			</TextButton>
		</div>
	);
};

export default Notes;
