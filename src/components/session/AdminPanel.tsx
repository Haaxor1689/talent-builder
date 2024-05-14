'use client';

import { Download, RotateCcw, Settings, Upload } from 'lucide-react';
import { useState } from 'react';

import {
	exportTable,
	importTable,
	regenerateIds
} from '~/server/api/routers/general';
import useAsyncAction from '~/hooks/useAsyncAction';

import DialogButton from '../styled/DialogButton';
import TextButton from '../styled/TextButton';
import Input from '../form/Input';

const AdminPanel = () => {
	const [table, setTable] = useState('');
	const { asyncAction, disableInteractions } = useAsyncAction();
	return (
		<DialogButton
			clickAway
			dialog={
				<div className="tw-surface flex flex-col gap-2 bg-darkerGray/90">
					<h3 className="tw-color">Admin panel</h3>
					<div className="flex gap-2">
						<Input
							placeholder="Table name"
							value={table}
							onChange={e => setTable(e.currentTarget.value)}
						/>
						<TextButton
							icon={Download}
							title="Export"
							onClick={asyncAction(() => exportTable(table as never))}
							disabled={disableInteractions}
						/>
						<TextButton
							icon={Upload}
							title="Import"
							onClick={asyncAction(() => importTable(table as never))}
							disabled={disableInteractions}
						/>
					</div>
					<TextButton
						icon={RotateCcw}
						onClick={asyncAction(() => regenerateIds(undefined))}
						disabled={disableInteractions}
					>
						Regenerate IDs
					</TextButton>
				</div>
			}
		>
			{open => (
				<TextButton icon={Settings} title="Admin panel" onClick={open} />
			)}
		</DialogButton>
	);
};

export default AdminPanel;
