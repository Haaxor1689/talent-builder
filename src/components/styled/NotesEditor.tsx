import cls from 'classnames';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { Markdown } from '#components/Icons.tsx';

import Md from './Md';
import ScrollArea from './ScrollArea';
import TextButton from './TextButton';

type Props = {
	value: string | null;
	onChange: (value: string | null) => void;
	editable?: boolean;
	editAction?: (stopEditing: () => void) => void;
	emptyText: string;
};

const NotesEditor = ({
	value,
	onChange,
	editable,
	editAction,
	emptyText
}: Props) => {
	const [editing, setEditing] = useState(false);

	if (!editable || !editing)
		return (
			<ScrollArea
				containerClassName="h-full"
				contentClassName={cls(
					'flex min-h-32 flex-col gap-3 p-3',
					!value && 'h-full justify-center text-center'
				)}
			>
				{editable && (
					<TextButton
						icon={<Pencil />}
						onClick={() => setEditing(true)}
						className="absolute right-2 bottom-2 z-10"
					>
						Edit Notes
					</TextButton>
				)}
				<Md text={value ?? emptyText} />
			</ScrollArea>
		);

	return (
		<div className="relative flex h-full min-h-32 flex-col">
			<TextareaAutosize
				value={value ?? ''}
				minRows={3}
				onChange={e => onChange(e.currentTarget.value || null)}
				placeholder="No notes..."
				className="shrink grow haax-input-hocus p-3"
			/>
			<div className="flex justify-between gap-2 p-2">
				<TextButton
					icon={<Markdown />}
					type="link"
					href="https://www.markdownguide.org/basic-syntax/"
					external
					className="text-sm text-blue-gray italic icon-size-5"
				>
					Markdown supported
				</TextButton>
				{editAction?.(() => setEditing(false)) ?? (
					<TextButton icon={<Pencil />} onClick={() => setEditing(false)}>
						Stop Editing
					</TextButton>
				)}
			</div>
		</div>
	);
};

export default NotesEditor;
