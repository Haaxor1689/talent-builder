import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { TalentForm, type TalentFormT } from './types';
import Button from './components/Button';
import DialogButton from './components/DialogButton';
import IconButton from './components/IconButton';
import { zodResolver } from './utils';

type Props = {
	onSubmit: (json: TalentFormT) => void;
};

const ImportDialog = ({ onSubmit }: Props) => {
	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(
			z.object({
				file: z.instanceof(FileList).transform(async (v, ctx) => {
					try {
						return TalentForm.parse(JSON.parse(await v[0]?.text()));
					} catch (e) {
						console.error(e);
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: 'Invalid file'
						});
						return z.NEVER;
					}
				})
			})
		)
	});

	return (
		<DialogButton
			dialog={close => (
				<form
					onSubmit={handleSubmit(v => {
						console.log(v.file);
						onSubmit(v.file);
						close();
					})}
					className="flex flex-col gap-4"
				>
					<h2 className="text-xl font-bold">Import</h2>
					<div className="flex gap-4">
						<input type="file" {...register('file')} />
					</div>
					{errors.file?.message && (
						<p className="text-red-500">{errors.file?.message}</p>
					)}
					<p>
						<span className="font-bold">NOTE:</span> Importing will replace
						current talent tree.
					</p>
					<div className="flex gap-2">
						<Button dark onClick={close} className="flex-grow">
							Cancel
						</Button>
						<Button type="submit" dark className="flex-grow">
							Ok
						</Button>
					</div>
				</form>
			)}
		>
			{open => (
				<IconButton onClick={open} icon={faUpload} title="Import" dark />
			)}
		</DialogButton>
	);
};

export default ImportDialog;
