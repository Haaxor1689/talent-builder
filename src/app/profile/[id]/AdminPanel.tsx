'use client';

import { useState, useTransition } from 'react';
import { Download, Upload } from 'lucide-react';

import Input from '#components/form/Input.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import { toast } from '#components/ToastProvider.tsx';
import {
	exportCollection,
	importCollection
} from '#server/api/collection.actions.ts';

const AdminPanel = () => {
	const [isPending, startTransition] = useTransition();
	const [collection, setCollection] = useState('');

	return (
		<form className="haax-surface-3">
			<h3 className="haax-color">Import/export talent collection</h3>
			<hr />
			<Input
				placeholder="Collection name"
				value={collection}
				onChange={e => setCollection(e.currentTarget.value)}
			/>
			<div className="flex gap-2 self-end">
				<TextButton
					icon={Upload}
					onClick={() =>
						startTransition(async () => {
							const [file] = await window.showOpenFilePicker({
								multiple: false
							});
							if (!file) return;
							return importCollection({
								collection,
								json: await file.getFile().then(f => f.text())
							});
						})
					}
					disabled={isPending}
					className="self-end"
				>
					Import from JSON
				</TextButton>
				<TextButton
					icon={Download}
					onClick={() =>
						startTransition(async () => {
							const response = await exportCollection({ collection });
							window.navigator.clipboard.writeText(response);
							toast({ message: 'Copied to clipboard', type: 'success' });
						})
					}
					disabled={isPending}
					className="self-end"
				>
					Export to JSON
				</TextButton>
			</div>
		</form>
	);
};
export default AdminPanel;
