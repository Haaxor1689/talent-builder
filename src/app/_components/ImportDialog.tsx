'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Upload } from 'lucide-react';

import { TalentForm, type TalentFormT } from '../../server/api/types';

import DialogButton from './styled/DialogButton';
import { zodResolver } from './utils';
import TextButton from './styled/TextButton';

type Props = {
	disabled?: boolean;
	onSubmit: (json: TalentFormT) => void;
};

const ImportDialog = ({ disabled, onSubmit }: Props) => {
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
			dialog={close => (
				<form
					onSubmit={handleSubmit(v => {
						onSubmit(v.file);
						close();
					})}
					className="tw-surface flex flex-col gap-4 bg-darkGray/90"
				>
					<h3 className="tw-color">Import</h3>
					<div className="flex gap-4">
						<input type="file" {...register('file')} />
					</div>
					{errors.file?.message && (
						<p className="text-red">{errors.file?.message}</p>
					)}
					<p className="text-blueGray">
						<span className="font-bold">NOTE:</span> Importing will replace
						current talent tree.
					</p>
					<div className="-m-2 flex justify-end gap-2">
						<TextButton onClick={close}>Cancel</TextButton>
						<TextButton type="submit">Ok</TextButton>
					</div>
				</form>
			)}
		>
			{open => (
				<TextButton
					onClick={open}
					icon={Upload}
					title="Import"
					disabled={disabled}
				/>
			)}
		</DialogButton>
	);
};

export default ImportDialog;
