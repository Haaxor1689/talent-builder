'use client';

import { useController } from 'react-hook-form';
import { X } from 'lucide-react';

import {
	GameVersionLogo,
	GameVersions
} from '#components/styled/GameVersion.tsx';

import Dialog, { closeDialog } from '../styled/Dialog';
import TextButton from '../styled/TextButton';

type Props = {
	name: string;
};

const VersionPicker = ({ name }: Props) => {
	const { field } = useController({ name });
	const version = GameVersions[field.value ?? -1];
	return (
		<Dialog
			trigger={open => (
				<TextButton
					icon={<GameVersionLogo rows={version?.rows ?? 0} />}
					onClick={open}
					className={field.value === undefined ? 'text-blue-gray' : ''}
				>
					{version?.name ?? 'Any version'}
				</TextButton>
			)}
		>
			<div className="flex items-center justify-between gap-2">
				<h3 className="haax-color">Pick Version</h3>

				<TextButton
					icon={<X />}
					onClick={e => {
						field.onChange(undefined);
						field.onBlur();
						closeDialog(e);
					}}
					className="text-red -m-2"
				>
					Clear
				</TextButton>
			</div>

			<hr />

			{GameVersions.map((version, idx) => (
				<TextButton
					key={idx}
					icon={<GameVersionLogo rows={version?.rows ?? 0} />}
					active={field.value === idx}
					onClick={e => {
						field.onChange(idx);
						field.onBlur();
						closeDialog(e);
					}}
				>
					{version.name}
				</TextButton>
			))}
		</Dialog>
	);
};

export default VersionPicker;
