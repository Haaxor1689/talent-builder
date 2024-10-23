'use client';

import { Download, Upload, User, Images } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import Input from '~/components/form/Input';
import Textarea from '~/components/form/Textarea';
import TextButton from '~/components/styled/TextButton';
import useAsyncAction from '~/hooks/useAsyncAction';
import {
	createTurtleWoWAccount,
	exportTable,
	exportMissingIcons,
	importTable
} from '~/server/api/routers/general';
import { downloadBlob } from '~/utils';
import {
	exportCollection,
	importCollection
} from '~/server/api/routers/collection';

import AdminModule from './AdminModule';

const PageContent = () => {
	const { asyncAction, disableInteractions } = useAsyncAction();

	const [table, setTable] = useState('');
	const [dbImport, setDbImport] = useState('');

	const [collection, setCollection] = useState('');
	const [clientImport, setClientImport] = useState('');

	return (
		<>
			<h2 className="self-center">Admin panel</h2>
			<div className="flex flex-wrap gap-2">
				<AdminModule title="Utilities">
					<TextButton
						icon={User}
						onClick={asyncAction(() => createTurtleWoWAccount(undefined))}
						disabled={disableInteractions}
					>
						Create TurtleWoW account
					</TextButton>
					<TextButton
						icon={Images}
						onClick={asyncAction(async () => {
							const response = await exportMissingIcons(undefined);
							window.navigator.clipboard.writeText(response);
							toast.success('Copied to clipboard');
						})}
						disabled={disableInteractions}
					>
						Export WoWHead icons
					</TextButton>
				</AdminModule>

				<AdminModule title="Table export and import">
					<Input
						placeholder="Table name"
						value={table}
						onChange={e => setTable(e.currentTarget.value)}
					/>
					<Textarea
						value={dbImport}
						onChange={e => setDbImport(e.currentTarget.value)}
						placeholder="Paste JSON here..."
						maxRows={5}
						className="flex-grow"
					/>
					<div className="flex gap-2 self-end">
						<TextButton
							icon={Upload}
							onClick={asyncAction(() =>
								importTable({ data: dbImport, table: table as never })
							)}
							disabled={disableInteractions}
						>
							Import
						</TextButton>
						<TextButton
							icon={Download}
							onClick={asyncAction(async () => {
								const response = await exportTable(table as never);
								downloadBlob(
									new Blob([response]),
									`talent-builder_${table}.json`
								);
							})}
							disabled={disableInteractions}
						>
							Export
						</TextButton>
					</div>
				</AdminModule>

				<AdminModule title="Import/export collection">
					<Input
						placeholder="Collection name"
						value={collection}
						onChange={e => setCollection(e.currentTarget.value)}
					/>
					<Textarea
						value={clientImport}
						onChange={e => setClientImport(e.currentTarget.value)}
						placeholder="Paste JSON here..."
						maxRows={5}
						className="flex-grow"
					/>
					<div className="flex gap-2 self-end">
						<TextButton
							icon={Upload}
							onClick={asyncAction(() =>
								importCollection({ collection, json: clientImport })
							)}
							disabled={disableInteractions}
							className="self-end"
						>
							Import
						</TextButton>
						<TextButton
							icon={Download}
							onClick={asyncAction(async () => {
								const response = await exportCollection(collection);
								window.navigator.clipboard.writeText(response);
								toast.success('Copied to clipboard');
							})}
							disabled={disableInteractions}
							className="self-end"
						>
							Export
						</TextButton>
					</div>
				</AdminModule>
			</div>
		</>
	);
};
export default PageContent;
