import cls from 'classnames';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useController } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';

import { Markdown } from '#components/Icons.tsx';
import { type TalentForm } from '#server/schemas.ts';

import Md from '../styled/Md';
import ScrollArea from '../styled/ScrollArea';
import TextButton from '../styled/TextButton';

type Props = {
	editable?: boolean;
};

const Notes = ({ editable }: Props) => {
	const [editing, setEditing] = useState(false);
	const { field } = useController<TalentForm, 'notes'>({ name: 'notes' });

	if (!editable || !editing)
		return (
			<ScrollArea
				containerClassName="h-full"
				contentClassName={cls(
					'flex min-h-32 flex-col gap-3 p-3',
					!field.value && 'h-full justify-center text-center'
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
		<div className="relative flex h-full min-h-32 flex-col">
			<TextareaAutosize
				value={field.value ?? ''}
				minRows={3}
				onChange={e => field.onChange(e.currentTarget.value || null)}
				placeholder="No notes..."
				className="shrink grow haax-input-hocus p-3"
			/>
			<TextButton
				icon={<Markdown />}
				type="link"
				href="https://www.markdownguide.org/basic-syntax/"
				external
				className="absolute bottom-2 left-2 text-sm text-blue-gray italic icon-size-5"
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
