'use client';

import { Download, Upload } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import Input from '~/components/form/Input';
import TextButton from '~/components/styled/TextButton';
import useAsyncAction from '~/hooks/useAsyncAction';
import { exportTable, importTable } from '~/server/api/routers/general';
import { downloadBlob } from '~/utils';
import {
	exportCollection,
	importCollection
} from '~/server/api/routers/collection';

import AdminModule from './AdminModule';

const PageContent = () => {
	const a = useAsyncAction();

	const [table, setTable] = useState('');

	const [collection, setCollection] = useState('');

	return (
		<>
			<h2 className="self-center">Admin panel</h2>
			<div className="flex flex-wrap gap-2">
				<AdminModule title="Import/export DB table">
					<Input
						placeholder="Table name"
						value={table}
						onChange={e => setTable(e.currentTarget.value)}
					/>
					<div className="flex gap-2 self-end">
						<TextButton
							icon={Upload}
							onClick={a.action(async () => {
								const [file] = await window.showOpenFilePicker({
									multiple: false
								});
								if (!file) return;
								return importTable({
									data: await file.getFile().then(f => f.text()),
									table: table as never
								});
							})}
							disabled={a.loading}
						>
							Import
						</TextButton>
						<TextButton
							icon={Download}
							onClick={a.action(async () => {
								const response = await exportTable(table as never);
								downloadBlob(
									new Blob([response]),
									`talent-builder_${table}.json`
								);
							})}
							disabled={a.loading}
						>
							Export
						</TextButton>
					</div>
				</AdminModule>

				<AdminModule title="Import/export talent collection">
					<Input
						placeholder="Collection name"
						value={collection}
						onChange={e => setCollection(e.currentTarget.value)}
					/>
					<div className="flex gap-2 self-end">
						<TextButton
							icon={Upload}
							onClick={a.action(async () => {
								const [file] = await window.showOpenFilePicker({
									multiple: false
								});
								if (!file) return;
								return importCollection({
									collection,
									json: await file.getFile().then(f => f.text())
								});
							})}
							disabled={a.loading}
							className="self-end"
						>
							Import from JSON
						</TextButton>
						<TextButton
							icon={Download}
							onClick={a.action(async () => {
								const response = await exportCollection(collection);
								window.navigator.clipboard.writeText(response);
								toast.success('Copied to clipboard');
							})}
							disabled={a.loading}
							className="self-end"
						>
							Export to CSV
						</TextButton>
					</div>
				</AdminModule>
			</div>
		</>
	);
};
export default PageContent;
