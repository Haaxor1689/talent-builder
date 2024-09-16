'use client';

import { Download, Upload, RotateCcw, User, Images } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import Input from '~/components/form/Input';
import Textarea from '~/components/form/Textarea';
import TextButton from '~/components/styled/TextButton';
import useAsyncAction from '~/hooks/useAsyncAction';
import {
	createTurtleWoWAccount,
	exportClientTrees,
	exportTable,
	exportMissingIcons,
	importClientTrees,
	importTable,
	regenerateIds
} from '~/server/api/routers/general';
import { downloadBlob } from '~/utils';

import AdminModule from './AdminModule';

const Page = () => {
	const { asyncAction, disableInteractions } = useAsyncAction();

	const [table, setTable] = useState('');
	const [dbImport, setDbImport] = useState('');
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
						icon={RotateCcw}
						onClick={asyncAction(() => regenerateIds(undefined))}
						disabled={disableInteractions}
					>
						Regenerate IDs
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

				<AdminModule title="Import trees from client">
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
							onClick={asyncAction(() => importClientTrees(clientImport))}
							disabled={disableInteractions}
							className="self-end"
						>
							Import
						</TextButton>
						<TextButton
							icon={Download}
							onClick={asyncAction(async () => {
								const response = await exportClientTrees(undefined);
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

export default Page;
