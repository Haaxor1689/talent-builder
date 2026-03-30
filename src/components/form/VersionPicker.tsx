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
	required?: boolean;
	disabled?: boolean;
};

const VersionPicker = ({ name, required, disabled }: Props) => {
	const { field } = useController({ name });
	const version =
		GameVersions.find(v => v.rows === field.value) ?? GameVersions[0];
	return (
		<Dialog
			trigger={open => (
				<TextButton
					icon={<GameVersionLogo rows={field.value} />}
					onClick={open}
					disabled={disabled}
					className={field.value === undefined ? 'text-blue-gray' : ''}
				>
					{field.value === undefined ? 'Any version' : version?.name}
				</TextButton>
			)}
		>
			<div className="flex items-center justify-between gap-2">
				<h3 className="haax-color">Pick Version</h3>

				{!required && (
					<TextButton
						icon={<X />}
						onClick={e => {
							field.onChange(undefined);
							field.onBlur();
							closeDialog(e);
						}}
						className="-m-2 text-red"
					>
						Clear
					</TextButton>
				)}
			</div>

			<hr />

			{GameVersions.map((version, idx) => (
				<TextButton
					key={idx}
					icon={<GameVersionLogo rows={version?.rows} />}
					active={field.value === version.rows}
					onClick={e => {
						field.onChange(version.rows);
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
