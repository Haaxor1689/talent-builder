'use client';

import { useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { ClipboardCopy, FileJson2 } from 'lucide-react';

import { TalentForm, type TalentFormT } from '../../server/api/types';
import { zodResolver } from '../../utils';

import DialogButton from './styled/DialogButton';
import TextButton from './styled/TextButton';

type Props = {
	disabled?: boolean;
};

const ImportDialog = ({ disabled }: Props) => {
	const { reset, getValues } = useFormContext<TalentFormT>();

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(
			z.object({
				file:
					typeof window !== 'undefined'
						? z.instanceof(FileList).transform(async (v, ctx) => {
								try {
									return TalentForm.parse(
										JSON.parse((await v[0]?.text()) ?? '')
									);
								} catch (e) {
									console.error(e);
									ctx.addIssue({
										code: z.ZodIssueCode.custom,
										message: 'Invalid file'
									});
									return z.NEVER;
								}
						  })
						: z.never()
			})
		)
	});

	return (
		<DialogButton
			clickAway
			dialog={close => (
				<form
					onSubmit={handleSubmit(v => {
						reset({ ...v.file, id: getValues().id });
						close();
					})}
					className="tw-surface flex flex-col gap-4 bg-darkGray/90"
				>
					<h3 className="tw-color">Import/Export</h3>
					<div className="flex items-center gap-4">
						<p>Export:</p>
						<TextButton
							icon={ClipboardCopy}
							onClick={() =>
								navigator.clipboard.writeText(JSON.stringify(getValues()))
							}
							className="-m-2"
						>
							Copy to clipboard
						</TextButton>
					</div>
					<div className="flex items-center gap-4">
						<p>Import:</p>
						<input
							type="file"
							{...register('file')}
							className="text-blueGray file:border-[2px] file:border-solid file:border-gray/40 file:bg-darkerGray/50 file:text-white file:transition-colors file:hocus:border-blueGray file:hocus:bg-darkGray"
						/>
					</div>
					<p className="text-blueGray">
						<span className="font-bold">NOTE:</span> Importing will replace
						current talent tree.
					</p>
					<div className="flex items-center gap-2">
						<p className="grow text-red">{errors.file?.message}</p>
						<TextButton type="submit">Import</TextButton>
					</div>
				</form>
			)}
		>
			{open => (
				<TextButton
					onClick={open}
					icon={FileJson2}
					title="Import/Export"
					disabled={disabled}
				/>
			)}
		</DialogButton>
	);
};

export default ImportDialog;
