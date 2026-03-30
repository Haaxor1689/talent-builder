import { useState } from 'react';
import { useController } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import cls from 'classnames';
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
				contentClassName={cls(
					'p-3 flex flex-col gap-3 min-h-32',
					!field.value && 'text-center justify-center h-full'
				)}
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
				<Md text={field.value ?? '*This tree contains no general notes.*'} />
			</ScrollArea>
		);

	return (
		<div className="relative flex h-full flex-col min-h-32">
			<TextareaAutosize
				value={field.value}
				minRows={3}
				onChange={e => field.onChange(e.currentTarget.value || null)}
				placeholder="No notes..."
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
